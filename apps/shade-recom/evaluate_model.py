"""
=============================================================================
AMORE COSMETICS — SHADE RECOMMENDATION & SKIN TONE MODEL EVALUATOR
=============================================================================
Evaluates:
  1. Skin Tone Classifier (Accuracy, Precision, Recall, F1, Confusion Matrix)
  2. Perceptual Lightness (L*) & CIE LAB Heuristic Fallback
  3. Shade Compatibility Recommender (Contrast, Undertone Alignment, Coverage)
  4. End-to-End Latency Benchmark & Robustness Stress Testing
=============================================================================
"""

import os
import sys
import time
import math
import numpy as np
import colorsys

# Ensure local imports resolve
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from shade_utils import rgb_to_lab, lab_to_hue, lab_to_chroma, hex_to_rgb
from recommendation import (
    load_shade_catalogue,
    calculate_compatibility,
    recommend_shades,
)

try:
    import joblib
    HAS_JOBLIB = True
except ImportError:
    HAS_JOBLIB = False

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    precision_recall_fscore_support,
)
from sklearn.naive_bayes import GaussianNB
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import VotingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline


# =============================================================================
# 1. DERMATOLOGICAL BENCHMARK DATASET (FITZPATRICK & MONK SCALE REFERENCE)
# =============================================================================

# Standardized ground truth skin tone profiles spanning Fitzpatrick I-VI / Monk 1-10
BENCHMARK_PROFILES = [
    # Light Skin Tones (Fitzpatrick I-II, L* >= 64)
    {"name": "Porcelain Cool", "r": 250, "g": 222, "b": 215, "label": "light", "undertone": "cool"},
    {"name": "Ivory Neutral",  "r": 242, "g": 218, "b": 195, "label": "light", "undertone": "neutral"},
    {"name": "Warm Fair Pale", "r": 245, "g": 210, "b": 178, "label": "light", "undertone": "warm"},
    {"name": "Peachy Light",   "r": 240, "g": 204, "b": 180, "label": "light", "undertone": "warm"},
    {"name": "Alabaster",      "r": 235, "g": 205, "b": 188, "label": "light", "undertone": "cool"},

    # Fair / Medium-Light Tones (Fitzpatrick III-IV, 50 <= L* < 64)
    {"name": "Golden Fair",    "r": 215, "g": 172, "b": 138, "label": "fair", "undertone": "warm"},
    {"name": "Wheat Medium",   "r": 200, "g": 158, "b": 125, "label": "fair", "undertone": "warm"},
    {"name": "Warm Beige",     "r": 195, "g": 150, "b": 120, "label": "fair", "undertone": "neutral"},
    {"name": "Olive Neutral",  "r": 188, "g": 148, "b": 112, "label": "fair", "undertone": "neutral"},
    {"name": "Rosy Beige",     "r": 205, "g": 155, "b": 135, "label": "fair", "undertone": "cool"},

    # Dark / Deep Tones (Fitzpatrick V-VI, L* < 50)
    {"name": "Warm Caramel",   "r": 160, "g": 110, "b": 78,  "label": "dark", "undertone": "warm"},
    {"name": "Chestnut Bronze","r": 140, "g": 90,  "b": 60,  "label": "dark", "undertone": "neutral"},
    {"name": "Deep Mocha",     "r": 115, "g": 72,  "b": 48,  "label": "dark", "undertone": "cool"},
    {"name": "Espresso Rich",  "r": 92,  "g": 55,  "b": 38,  "label": "dark", "undertone": "neutral"},
    {"name": "Ebony Deep",     "r": 68,  "g": 42,  "b": 30,  "label": "dark", "undertone": "cool"},
]


def rgb_to_features(r, g, b):
    """Computes the 6-feature vector: [mean_r, mean_g, mean_b, mean_h, mean_s, mean_v]."""
    r_n, g_n, b_n = r / 255.0, g / 255.0, b / 255.0
    h, s, v = colorsys.rgb_to_hsv(r_n, g_n, b_n)
    return [float(r), float(g), float(b), float(h * 180.0), float(s * 255.0), float(v * 255.0)]


def generate_synthetic_training_set(samples_per_profile=40, seed=42):
    """
    Synthesizes realistic training samples around benchmark skin tones
    with Gaussian noise modeling camera exposure, lighting, and white-balance shifts.
    """
    np.random.seed(seed)
    X, y = [], []

    for profile in BENCHMARK_PROFILES:
        base_r, base_g, base_b = profile["r"], profile["g"], profile["b"]
        label = profile["label"]

        for _ in range(samples_per_profile):
            # Exposure jitter (-12 to +12) & channel noise (-6 to +6)
            exposure = np.random.normal(0, 7)
            noise_r = np.clip(base_r + exposure + np.random.normal(0, 4), 10, 255)
            noise_g = np.clip(base_g + exposure + np.random.normal(0, 4), 10, 255)
            noise_b = np.clip(base_b + exposure + np.random.normal(0, 4), 10, 255)

            feats = rgb_to_features(noise_r, noise_g, noise_b)
            X.append(feats)
            y.append(label)

    return np.array(X, dtype=np.float32), np.array(y)


# =============================================================================
# 2. ENSEMBLE MODEL TRAINING / VERIFICATION
# =============================================================================

def train_or_load_ensemble(model_path):
    """Loads existing trained model or trains a new calibrated soft-voting ensemble."""
    if os.path.exists(model_path):
        try:
            model = joblib.load(model_path)
            print(f"[OK] Found existing ensemble model at: {model_path}")
            return model, False
        except Exception as e:
            print(f"Notice: Loading existing model failed ({e}). Re-training.")

    print("[INFO] Training standardized ensemble model (GaussianNB + LogisticRegression + SVC)...")
    X_train, y_train = generate_synthetic_training_set(samples_per_profile=60, seed=123)

    nb = GaussianNB()
    lr = LogisticRegression(max_iter=1000, random_state=42)
    svm = SVC(probability=True, kernel="rbf", C=1.0, random_state=42)

    ensemble = VotingClassifier(
        estimators=[("nb", nb), ("lr", lr), ("svm", svm)],
        voting="soft",
    )

    pipeline = Pipeline([("scaler", StandardScaler()), ("ensemble", ensemble)])
    pipeline.fit(X_train, y_train)

    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump(pipeline, model_path)
    print(f"[OK] Trained and saved new ensemble model to: {model_path}")
    return pipeline, True


# =============================================================================
# 3. EVALUATION RUNNER
# =============================================================================

def evaluate_skin_tone_classifier(model):
    """Evaluates classification accuracy and per-class metrics against held-out validation data."""
    X_val, y_true = generate_synthetic_training_set(samples_per_profile=30, seed=999)
    y_pred = model.predict(X_val)
    probas = model.predict_proba(X_val)

    acc = accuracy_score(y_true, y_pred)
    classes = list(model.classes_)
    precision, recall, f1, support = precision_recall_fscore_support(
        y_true, y_pred, labels=classes, zero_division=0
    )
    cm = confusion_matrix(y_true, y_pred, labels=classes)

    return {
        "accuracy": acc,
        "classes": classes,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "support": support,
        "confusion_matrix": cm,
        "val_size": len(y_true),
    }


def evaluate_heuristic_classifier():
    """Evaluates the built-in L* heuristic classifier fallback."""
    X_val, y_true = generate_synthetic_training_set(samples_per_profile=30, seed=999)
    y_pred = []

    for sample in X_val:
        r, g, b = sample[0], sample[1], sample[2]
        lab = rgb_to_lab(r, g, b)
        L = lab["L"]
        if L >= 64:
            y_pred.append("light")
        elif L >= 50:
            y_pred.append("fair")
        else:
            y_pred.append("dark")

    classes = ["dark", "fair", "light"]
    acc = accuracy_score(y_true, y_pred)
    precision, recall, f1, support = precision_recall_fscore_support(
        y_true, y_pred, labels=classes, zero_division=0
    )
    cm = confusion_matrix(y_true, y_pred, labels=classes)

    return {
        "accuracy": acc,
        "classes": classes,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "support": support,
        "confusion_matrix": cm,
        "val_size": len(y_true),
    }


def evaluate_shade_recommendations():
    """Evaluates recommendation quality across dermatological skin profiles."""
    shades = load_shade_catalogue()
    catalogue_ids = {s["id"] for s in shades}

    profile_results = []
    contrast_pass_count = 0
    total_recs_checked = 0
    all_recommended_ids = set()

    for p in BENCHMARK_PROFILES:
        skin_lab = rgb_to_lab(p["r"], p["g"], p["b"])
        recs = recommend_shades(skin_lab, number_of_results=5)

        top1 = recs[0]
        top3_avg_compat = np.mean([r["compatibility"] for r in recs[:3]])
        top_names = [r["name"] for r in recs[:3]]

        # Contrast evaluation: Recommended lipsticks should maintain proper contrast (|L_skin - L_shade| >= 10)
        profile_contrasts = []
        for r in recs:
            all_recommended_ids.add(r["id"])
            total_recs_checked += 1
            diff_l = abs(skin_lab["L"] - r["lab"]["L"])
            profile_contrasts.append(diff_l)
            if diff_l >= 10:
                contrast_pass_count += 1

        profile_results.append({
            "name": p["name"],
            "tone": p["label"],
            "undertone": p["undertone"],
            "skin_L": round(skin_lab["L"], 1),
            "top1_name": top1["name"],
            "top1_score": top1["compatibility"],
            "top3_avg": round(top3_avg_compat, 1),
            "top_names": top_names,
            "avg_contrast": round(np.mean(profile_contrasts), 1),
        })

    coverage_pct = (len(all_recommended_ids) / len(catalogue_ids)) * 100
    contrast_compliance = (contrast_pass_count / total_recs_checked) * 100

    return {
        "profile_results": profile_results,
        "coverage_pct": coverage_pct,
        "distinct_shades_recommended": len(all_recommended_ids),
        "total_catalogue_shades": len(catalogue_ids),
        "contrast_compliance": round(contrast_compliance, 1),
    }


def benchmark_latency(model, iterations=100):
    """Measures end-to-end inference latency."""
    dummy_r, dummy_g, dummy_b = 205, 155, 125
    features = np.array([rgb_to_features(dummy_r, dummy_g, dummy_b)], dtype=np.float32)
    skin_lab = rgb_to_lab(dummy_r, dummy_g, dummy_b)

    latencies_ms = []

    for _ in range(iterations):
        t0 = time.perf_counter()
        _ = model.predict(features)[0]
        _ = model.predict_proba(features)[0]
        _ = recommend_shades(skin_lab, number_of_results=5)
        t1 = time.perf_counter()
        latencies_ms.append((t1 - t0) * 1000.0)

    return {
        "iterations": iterations,
        "mean_ms": round(float(np.mean(latencies_ms)), 2),
        "p50_ms": round(float(np.percentile(latencies_ms, 50)), 2),
        "p95_ms": round(float(np.percentile(latencies_ms, 95)), 2),
        "p99_ms": round(float(np.percentile(latencies_ms, 99)), 2),
    }


# =============================================================================
# 4. REPORT FORMATTER & MAIN ENTRYPOINT
# =============================================================================

def print_evaluation_report():
    print("\n" + "=" * 78)
    print("      AMORE COSMETICS -- AI SHADE RECOMMENDATION MODEL EVALUATION      ")
    print("=" * 78)

    model_path = os.path.join(BASE_DIR, "models", "skintone_ensemble_model.pkl")
    model, was_trained = train_or_load_ensemble(model_path)

    # 1. Ensemble Evaluation
    ensemble_metrics = evaluate_skin_tone_classifier(model)

    print("\n" + "-" * 78)
    print(" 1. SKIN TONE CLASSIFICATION: ENSEMBLE MODEL (NB + LR + SVM)")
    print("-" * 78)
    print(f"Validation Samples: {ensemble_metrics['val_size']} | Overall Accuracy: {ensemble_metrics['accuracy'] * 100:.2f}%\n")
    print(f"{'Class':<12} {'Precision':<12} {'Recall':<12} {'F1-Score':<12} {'Support':<10}")
    print("-" * 58)

    for i, cls in enumerate(ensemble_metrics["classes"]):
        p = ensemble_metrics["precision"][i]
        r = ensemble_metrics["recall"][i]
        f = ensemble_metrics["f1"][i]
        s = ensemble_metrics["support"][i]
        print(f"{cls:<12} {p * 100:>8.2f}%   {r * 100:>8.2f}%   {f * 100:>8.2f}%   {s:>8}")

    print("\nConfusion Matrix (Rows: True, Columns: Predicted):")
    print(f"{'':<10} " + " ".join([f"{c:>8}" for c in ensemble_metrics["classes"]]))
    for i, row in enumerate(ensemble_metrics["confusion_matrix"]):
        row_str = " ".join([f"{val:>8}" for val in row])
        print(f"{ensemble_metrics['classes'][i]:<10} {row_str}")

    # 2. Heuristic Fallback Evaluation
    heuristic_metrics = evaluate_heuristic_classifier()
    print("\n" + "-" * 78)
    print(" 2. SKIN TONE CLASSIFICATION: PERCEPTUAL L* HEURISTIC FALLBACK")
    print("-" * 78)
    print(f"Validation Samples: {heuristic_metrics['val_size']} | Overall Accuracy: {heuristic_metrics['accuracy'] * 100:.2f}%\n")
    print(f"{'Class':<12} {'Precision':<12} {'Recall':<12} {'F1-Score':<12} {'Support':<10}")
    print("-" * 58)

    for i, cls in enumerate(heuristic_metrics["classes"]):
        p = heuristic_metrics["precision"][i]
        r = heuristic_metrics["recall"][i]
        f = heuristic_metrics["f1"][i]
        s = heuristic_metrics["support"][i]
        print(f"{cls:<12} {p * 100:>8.2f}%   {r * 100:>8.2f}%   {f * 100:>8.2f}%   {s:>8}")

    # 3. Recommendation Engine Quality
    recom_metrics = evaluate_shade_recommendations()
    print("\n" + "-" * 78)
    print(" 3. SHADE COMPATIBILITY & COSMETIC RECOMMENDATION ENGINE")
    print("-" * 78)
    print(f"Catalogue Coverage: {recom_metrics['distinct_shades_recommended']}/{recom_metrics['total_catalogue_shades']} shades ({recom_metrics['coverage_pct']:.1f}%)")
    print(f"Lightness Contrast Compliance (Delta L* >= 10): {recom_metrics['contrast_compliance']}%")
    print("\nBenchmark Sample Profile Recommendations:")
    print(f"{'Profile':<18} {'Skin Tone':<10} {'L*':<6} {'Top Recommendation':<20} {'Match %':<10} {'Top 3 Average':<12}")
    print("-" * 78)

    for pr in recom_metrics["profile_results"]:
        print(f"{pr['name']:<18} {pr['tone']:<10} {pr['skin_L']:<6} {pr['top1_name']:<20} {pr['top1_score']:>5.1f}%     {pr['top3_avg']:>5.1f}%")

    # 4. Latency Performance
    latency = benchmark_latency(model, iterations=150)
    print("\n" + "-" * 78)
    print(" 4. INFERENCE LATENCY BENCHMARK (150 Iterations)")
    print("-" * 78)
    print(f"  - Average Latency:  {latency['mean_ms']} ms")
    print(f"  - Median (P50):     {latency['p50_ms']} ms")
    print(f"  - 95th Percentile:  {latency['p95_ms']} ms")
    print(f"  - 99th Percentile:  {latency['p99_ms']} ms")
    print(f"  - Throughput:       ~{int(1000.0 / max(0.1, latency['mean_ms']))} requests/second")

    # 5. Summary Evaluation Verdict
    print("\n" + "=" * 78)
    overall_pass = (
        ensemble_metrics["accuracy"] >= 0.85
        and recom_metrics["contrast_compliance"] >= 90.0
        and latency["p95_ms"] < 25.0
    )
    status_str = "PASS -- PRODUCTION READY" if overall_pass else "NOTICE -- TUNING RECOMMENDED"
    print(f"OVERALL EVALUATION VERDICT: [{status_str}]")
    print("=" * 78 + "\n")


if __name__ == "__main__":
    print_evaluation_report()
