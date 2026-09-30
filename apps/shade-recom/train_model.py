import os
import cv2
import numpy as np
import joblib

from sklearn.naive_bayes import GaussianNB
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import VotingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline


# ---------------------------------------------------------
# FEATURE EXTRACTION
# ---------------------------------------------------------

def extract_features(image_path):
    """
    Extract average RGB and HSV values
    from the center region of an image.
    """

    img = cv2.imread(image_path)

    if img is None:
        return None

    h, w = img.shape[:2]

    # Center 50% crop
    center_img = img[
        int(h * 0.25):int(h * 0.75),
        int(w * 0.25):int(w * 0.75)
    ]

    if center_img.size == 0:
        return None

    # -------------------------
    # RGB
    # -------------------------

    rgb_img = cv2.cvtColor(
        center_img,
        cv2.COLOR_BGR2RGB
    )

    mean_r, mean_g, mean_b = np.mean(
        rgb_img,
        axis=(0, 1)
    )

    # -------------------------
    # HSV
    # -------------------------

    hsv_img = cv2.cvtColor(
        center_img,
        cv2.COLOR_BGR2HSV
    )

    mean_h, mean_s, mean_v = np.mean(
        hsv_img,
        axis=(0, 1)
    )

    return [
        mean_r,
        mean_g,
        mean_b,
        mean_h,
        mean_s,
        mean_v
    ]


# ---------------------------------------------------------
# DATASET LOADER
# ---------------------------------------------------------

def load_dataset(base_path):

    X = []
    y = []

    classes = [
        "dark",
        "fair",
        "light"
    ]

    for label in classes:

        folder = os.path.join(
            base_path,
            label
        )

        if not os.path.exists(folder):
            print(
                f"Warning: Dataset folder not found: {folder}"
            )
            continue

        for file in os.listdir(folder):

            if file.lower().endswith(
                (".jpg", ".jpeg", ".png", ".webp")
            ):

                image_path = os.path.join(
                    folder,
                    file
                )

                features = extract_features(
                    image_path
                )

                if features is not None:

                    X.append(features)
                    y.append(label)

    return (
        np.array(X, dtype=np.float32),
        np.array(y)
    )


# ---------------------------------------------------------
# MAIN TRAINING
# ---------------------------------------------------------

if __name__ == "__main__":

    print("=" * 60)
    print("AMORE SKIN TONE MODEL TRAINING")
    print("=" * 60)

    dataset_path = "./data/skintone/train"
    model_path = "./models/skintone_ensemble_model.pkl"

    # Create models directory
    os.makedirs(
        "./models",
        exist_ok=True
    )

    print("\nLoading dataset...")

    X_train, y_train = load_dataset(
        dataset_path
    )

    print(
        f"Training samples: {len(X_train)}"
    )

    print(
        f"Features per sample: {X_train.shape[1]}"
    )

    print(
        "Classes:",
        np.unique(y_train)
    )

    # -----------------------------------------------------
    # BASE MODELS
    # -----------------------------------------------------

    nb_clf = GaussianNB()

    lr_clf = LogisticRegression(
        max_iter=1000,
        random_state=42
    )

    svm_clf = SVC(
        probability=True,
        random_state=42
    )

    # -----------------------------------------------------
    # SOFT VOTING ENSEMBLE
    # -----------------------------------------------------

    ensemble_model = VotingClassifier(

        estimators=[
            ("nb", nb_clf),
            ("lr", lr_clf),
            ("svm", svm_clf)
        ],

        voting="soft"
    )

    # -----------------------------------------------------
    # SCALING + ENSEMBLE
    # -----------------------------------------------------

    pipeline = Pipeline([
        (
            "scaler",
            StandardScaler()
        ),
        (
            "ensemble",
            ensemble_model
        )
    ])

    print("\nTraining ensemble model...")

    pipeline.fit(
        X_train,
        y_train
    )

    # -----------------------------------------------------
    # SAVE MODEL
    # -----------------------------------------------------

    joblib.dump(
        pipeline,
        model_path
    )

    print("\nModel saved successfully:")
    print(model_path)

    print("\nTraining complete!")