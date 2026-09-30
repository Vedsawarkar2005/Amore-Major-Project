import json
import os
import math

from shade_utils import (
    hex_to_rgb,
    rgb_to_lab,
    lab_to_hue,
    lab_to_chroma,
)


BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

CATALOGUE_PATH = os.path.join(
    BASE_DIR,
    "data",
    "shade_catalogue.json"
)

print(
    "Shade catalogue path:",
    CATALOGUE_PATH
)


def load_shade_catalogue():
    """
    Load the Amore shade catalogue and calculate
    LAB, hue and chroma automatically.
    """

    with open(CATALOGUE_PATH, "r", encoding="utf-8") as file:
        shades = json.load(file)

    processed_shades = []

    for shade in shades:

        r, g, b = hex_to_rgb(shade["hex"])

        lab = rgb_to_lab(r, g, b)

        processed_shade = {
            **shade,
            "rgb": {
                "r": r,
                "g": g,
                "b": b
            },
            "lab": lab,
            "hue": lab_to_hue(lab),
            "chroma": lab_to_chroma(lab)
        }

        processed_shades.append(processed_shade)

    return processed_shades


def hue_difference(h1, h2):
    """
    Calculate circular hue difference.

    Hue values range from 0-360.
    """

    difference = abs(h1 - h2)

    return min(
        difference,
        360 - difference
    )


def normalize(value, minimum, maximum):
    """
    Normalize value to 0-1.
    """

    if maximum == minimum:
        return 0.0

    value = (value - minimum) / (maximum - minimum)

    return max(0.0, min(1.0, value))


def calculate_compatibility(
    skin_lab,
    shade_lab,
    skin_hue,
    skin_chroma,
    shade_hue,
    shade_chroma
):
    """
    Calculate a compatibility score between
    the user's measured skin color and a lipstick shade.

    This is a project-specific heuristic score.

    It is NOT a probability and does not claim that
    one lipstick is objectively correct for a person.
    """

    # ---------------------------------------------
    # 1. Hue compatibility
    # ---------------------------------------------

    hue_diff = hue_difference(
        skin_hue,
        shade_hue
    )

    hue_score = 1 - normalize(
        hue_diff,
        0,
        180
    )

    # ---------------------------------------------
    # 2. Chroma compatibility
    # ---------------------------------------------

    chroma_difference = abs(
        skin_chroma - shade_chroma
    )

    chroma_score = 1 - normalize(
        chroma_difference,
        0,
        80
    )

    # ---------------------------------------------
    # 3. Lightness contrast
    # ---------------------------------------------

    lightness_difference = abs(
        skin_lab["L"] - shade_lab["L"]
    )

    # Very small differences can make lipstick
    # visually blend into the skin.
    #
    # Extremely large differences are also penalized.
    #
    # We therefore prefer a moderate amount of
    # lightness contrast.

    ideal_contrast = 25

    contrast_difference = abs(
        lightness_difference - ideal_contrast
    )

    contrast_score = 1 - normalize(
        contrast_difference,
        0,
        50
    )

    # ---------------------------------------------
    # 4. Color richness
    # ---------------------------------------------

    richness_score = normalize(
        shade_chroma,
        10,
        70
    )

    # ---------------------------------------------
    # Final score
    # ---------------------------------------------

    score = (
        hue_score * 0.35 +
        chroma_score * 0.20 +
        contrast_score * 0.30 +
        richness_score * 0.15
    )

    return round(
        max(0, min(1, score)) * 100,
        2
    )


def recommend_shades(
    skin_lab,
    number_of_results=5
):
    """
    Rank the Amore shade catalogue for a user's
    measured skin LAB color.
    """

    shades = load_shade_catalogue()

    skin_hue = lab_to_hue(skin_lab)

    skin_chroma = lab_to_chroma(skin_lab)

    results = []

    for shade in shades:

        score = calculate_compatibility(
            skin_lab=skin_lab,
            shade_lab=shade["lab"],
            skin_hue=skin_hue,
            skin_chroma=skin_chroma,
            shade_hue=shade["hue"],
            shade_chroma=shade["chroma"]
        )

        results.append({
            "id": shade["id"],
            "name": shade["name"],
            "hex": shade["hex"],
            "finish": shade["finish"],
            "compatibility": score,
            "lab": shade["lab"]
        })

    # Highest compatibility first
    results.sort(
        key=lambda item: item["compatibility"],
        reverse=True
    )

    return results[:number_of_results]