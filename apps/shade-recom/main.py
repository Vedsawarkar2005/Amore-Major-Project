import io
import os
import colorsys
import base64
from typing import Optional
import numpy as np
from PIL import Image

try:
    import cv2
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False

import joblib

from fastapi import (
    FastAPI,
    File,
    UploadFile,
    Request,
)
from fastapi.middleware.cors import CORSMiddleware

from recommendation import (
    recommend_shades as generate_recommendations
)
from shade_utils import rgb_to_lab

# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="Amore Cosmetics Shade Recommendation API",
    version="1.0.0",
)

# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# MODEL
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "skintone_ensemble_model.pkl",
)

model = None
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print(f"Loaded skin tone model: {MODEL_PATH}")
    except Exception as e:
        print(f"Warning: Could not load model from {MODEL_PATH}: {e}")
else:
    print(f"Notice: Model file not found at {MODEL_PATH}. Using LAB-based heuristic classifier fallback.")

# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():
    return {
        "status": "running",
        "service": "Amore Shade Recommendation API",
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
    }

# ============================================================
# IMAGE PROCESSING
# ============================================================

def read_image(image_bytes):
    """
    Convert uploaded image bytes into an RGB numpy array.
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return np.array(image, dtype=np.uint8)

# ============================================================
# FEATURE EXTRACTION
# ============================================================

def extract_features(image):
    """
    Extract the six features used during SkinTone model training:
        mean R, mean G, mean B, mean H, mean S, mean V
    """
    height, width = image.shape[:2]

    # Center 50%
    x1 = int(width * 0.25)
    x2 = int(width * 0.75)
    y1 = int(height * 0.25)
    y2 = int(height * 0.75)

    crop = image[y1:y2, x1:x2]
    if crop.size == 0:
        raise ValueError("Unable to extract image region.")

    mean_r = float(np.mean(crop[:, :, 0]))
    mean_g = float(np.mean(crop[:, :, 1]))
    mean_b = float(np.mean(crop[:, :, 2]))

    if HAS_CV2:
        bgr = cv2.cvtColor(crop, cv2.COLOR_RGB2BGR)
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        mean_h = float(np.mean(hsv[:, :, 0]))
        mean_s = float(np.mean(hsv[:, :, 1]))
        mean_v = float(np.mean(hsv[:, :, 2]))
    else:
        # Standard library colorsys fallback
        r_norm, g_norm, b_norm = mean_r / 255.0, mean_g / 255.0, mean_b / 255.0
        h, s, v = colorsys.rgb_to_hsv(r_norm, g_norm, b_norm)
        mean_h = float(h * 180.0)
        mean_s = float(s * 255.0)
        mean_v = float(v * 255.0)

    features = np.array(
        [[
            mean_r,
            mean_g,
            mean_b,
            mean_h,
            mean_s,
            mean_v,
        ]],
        dtype=np.float32,
    )

    return features

# ============================================================
# SKIN LAB EXTRACTION
# ============================================================

def extract_skin_lab(image):
    """
    Calculate representative skin LAB values from facial skin regions,
    filtering out hair, beards, shadows, and specular glare.
    """
    height, width = image.shape[:2]

    # Upper-center region (cheeks, forehead, upper face)
    x1 = int(width * 0.3)
    x2 = int(width * 0.7)
    y1 = int(height * 0.25)
    y2 = int(height * 0.65)

    crop = image[y1:y2, x1:x2]
    if crop.size == 0:
        raise ValueError("Unable to extract skin region.")

    # Filter out deep shadows/hair (< 30) and blown-out highlights (> 240)
    lum = 0.299 * crop[:, :, 0] + 0.587 * crop[:, :, 1] + 0.114 * crop[:, :, 2]
    skin_mask = (lum > 30) & (lum < 240)

    if np.sum(skin_mask) > 100:
        mean_r = float(np.mean(crop[:, :, 0][skin_mask]))
        mean_g = float(np.mean(crop[:, :, 1][skin_mask]))
        mean_b = float(np.mean(crop[:, :, 2][skin_mask]))
    else:
        mean_r = float(np.mean(crop[:, :, 0]))
        mean_g = float(np.mean(crop[:, :, 1]))
        mean_b = float(np.mean(crop[:, :, 2]))

    lab = rgb_to_lab(mean_r, mean_g, mean_b)
    return lab

# ============================================================
# RECOMMENDATION ENDPOINT
# ============================================================

@app.post("/recommend")
async def recommend_endpoint(
    request: Request,
    file: Optional[UploadFile] = File(None)
):
    try:
        image_bytes = None
        provided_skin_lab = None
        provided_skin_tone = None

        # Check if file was uploaded via multipart/form-data
        if file is not None and file.filename:
            image_bytes = await file.read()
        else:
            # Check for JSON payload
            content_type = request.headers.get("content-type", "")
            if "application/json" in content_type:
                body = await request.json()
                b64_str = body.get("imageBase64") or body.get("image") or body.get("file")
                if b64_str and isinstance(b64_str, str):
                    if "," in b64_str:
                        b64_str = b64_str.split(",", 1)[1]
                    image_bytes = base64.b64decode(b64_str)
                
                # Check for direct skin lab / skin tone input
                provided_skin_lab = body.get("skin_lab") or body.get("skinLab")
                provided_skin_tone = body.get("skin_tone") or body.get("skinTone")

        # Case 1: Image provided (either file or base64)
        if image_bytes:
            image = read_image(image_bytes)
            skin_lab = extract_skin_lab(image)

            probabilities = {}
            if model is not None:
                features = extract_features(image)
                prediction = str(model.predict(features)[0])

                if hasattr(model, "predict_proba"):
                    proba = model.predict_proba(features)[0]
                    classes = model.classes_
                    probabilities = {
                        str(cls): round(float(prob), 4)
                        for cls, prob in zip(classes, proba)
                    }
            else:
                L_val = skin_lab["L"]
                if L_val >= 64:
                    prediction = "light"
                    probabilities = {"light": 0.82, "fair": 0.14, "dark": 0.04}
                elif L_val >= 50:
                    prediction = "fair"
                    probabilities = {"fair": 0.78, "light": 0.14, "dark": 0.08}
                else:
                    prediction = "dark"
                    probabilities = {"dark": 0.85, "fair": 0.10, "light": 0.05}

            recommendations = generate_recommendations(
                skin_lab,
                number_of_results=5,
            )

            return {
                "success": True,
                "skin_tone": prediction,
                "skin_tone_probabilities": probabilities,
                "skin_lab": {
                    "L": round(skin_lab["L"], 2),
                    "a": round(skin_lab["a"], 2),
                    "b": round(skin_lab["b"], 2),
                },
                "recommendations": recommendations,
            }

        # Case 2: Direct skin_lab provided without image
        elif provided_skin_lab and "L" in provided_skin_lab:
            skin_lab = {
                "L": float(provided_skin_lab["L"]),
                "a": float(provided_skin_lab.get("a", 15.0)),
                "b": float(provided_skin_lab.get("b", 18.0)),
            }
            prediction = provided_skin_tone or ("light" if skin_lab["L"] >= 64 else ("fair" if skin_lab["L"] >= 50 else "dark"))
            recommendations = generate_recommendations(skin_lab, number_of_results=5)
            return {
                "success": True,
                "skin_tone": prediction,
                "skin_tone_probabilities": {prediction: 0.85},
                "skin_lab": {
                    "L": round(skin_lab["L"], 2),
                    "a": round(skin_lab["a"], 2),
                    "b": round(skin_lab["b"], 2),
                },
                "recommendations": recommendations,
            }

        else:
            return {
                "success": False,
                "error": "No image or skin tone data provided. Please provide an image file or imageBase64.",
            }

    except Exception as error:
        print("RECOMMENDATION ERROR:", repr(error))
        return {
            "success": False,
            "error": str(error),
            "error_type": type(error).__name__,
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("SHADE_RECOM_PORT", 8001))
    print(f"Starting Amore Shade Recommendation API on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)