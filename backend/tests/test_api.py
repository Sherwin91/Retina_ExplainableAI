from io import BytesIO

from PIL import Image
from fastapi.testclient import TestClient

from app.main import app


def image_bytes() -> bytes:
    image = Image.new("RGB", (64, 64), "black")
    output = BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()


def test_health_reports_missing_model() -> None:
    response = TestClient(app).get("/health")
    assert response.status_code == 200
    assert response.json()["model_status"] == "unavailable"


def test_rejects_unsupported_format() -> None:
    response = TestClient(app).post(
        "/predict",
        files={"image": ("image.txt", b"not an image", "text/plain")},
    )
    assert response.status_code == 415


def test_rejects_corrupt_image() -> None:
    response = TestClient(app).post(
        "/predict",
        files={"image": ("image.png", b"not an image", "image/png")},
    )
    assert response.status_code == 422


def test_rejects_missing_image() -> None:
    response = TestClient(app).post("/predict")
    assert response.status_code == 422


def test_rejects_oversized_upload() -> None:
    response = TestClient(app).post(
        "/predict",
        files={"image": ("large.png", b"x" * (10 * 1024 * 1024 + 1), "image/png")},
    )
    assert response.status_code == 413


def test_valid_image_fails_closed_without_model() -> None:
    response = TestClient(app).post(
        "/predict",
        files={"image": ("image.png", image_bytes(), "image/png")},
    )
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "model_unavailable"
