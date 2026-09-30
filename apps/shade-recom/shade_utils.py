import math


def hex_to_rgb(hex_color: str):
    """
    Convert HEX color to RGB.

    Example:
        #8C3725 -> (140, 55, 37)
    """

    hex_color = hex_color.lstrip("#")

    if len(hex_color) != 6:
        raise ValueError(f"Invalid HEX color: {hex_color}")

    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)

    return r, g, b


def rgb_to_lab(r, g, b):
    """
    Convert sRGB values (0-255) to CIE LAB.

    Uses D65 reference white.
    """

    # Normalize RGB
    r = r / 255.0
    g = g / 255.0
    b = b / 255.0

    # sRGB -> Linear RGB
    def inverse_gamma(value):
        if value > 0.04045:
            return ((value + 0.055) / 1.055) ** 2.4

        return value / 12.92

    r = inverse_gamma(r)
    g = inverse_gamma(g)
    b = inverse_gamma(b)

    # Linear RGB -> XYZ
    x = (
        r * 0.4124564
        + g * 0.3575761
        + b * 0.1804375
    )

    y = (
        r * 0.2126729
        + g * 0.7151522
        + b * 0.0721750
    )

    z = (
        r * 0.0193339
        + g * 0.1191920
        + b * 0.9503041
    )

    # D65 reference white
    x = x / 0.95047
    y = y / 1.00000
    z = z / 1.08883

    def f(value):
        delta = 6 / 29

        if value > delta ** 3:
            return value ** (1 / 3)

        return value / (3 * delta ** 2) + 4 / 29

    x = f(x)
    y = f(y)
    z = f(z)

    L = 116 * y - 16
    a = 500 * (x - y)
    b_value = 200 * (y - z)

    return {
        "L": L,
        "a": a,
        "b": b_value
    }


def lab_to_hue(lab):
    """
    Calculate hue angle from LAB a* and b*.
    """

    a = lab["a"]
    b = lab["b"]

    hue = math.degrees(math.atan2(b, a))

    if hue < 0:
        hue += 360

    return hue


def lab_to_chroma(lab):
    """
    Calculate chroma from LAB.
    """

    return math.sqrt(
        lab["a"] ** 2 +
        lab["b"] ** 2
    )


def color_distance(lab1, lab2):
    """
    Basic Euclidean LAB distance.
    """

    return math.sqrt(
        (lab1["L"] - lab2["L"]) ** 2 +
        (lab1["a"] - lab2["a"]) ** 2 +
        (lab1["b"] - lab2["b"]) ** 2
    )