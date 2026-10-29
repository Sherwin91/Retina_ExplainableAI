from __future__ import annotations

import io
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

from .config import load_settings
from .model import ModelService, ModelUnavailableError

settings = load_settings()
model_service = ModelService(settings.checkpoint_path, settings.model_version)
model_load_error: str | None = None


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global model_load_error
    try:
        model_service.load()
    except ModelUnavailableError as exc:
        model_load_error = str(exc)
        # Health and validation remain available; /predict stays fail-closed.
        pass
    yield


app = FastAPI(
    title="EyeCare DR Inference API",
    version="0.1.0",
    description="Research prototype API. No clinical use.",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.allowed_origins),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health() -> dict[str, object]:
    return {
        "status": "ok",
        "model_status": "ready" if model_service.available else "unavailable",
        "model_version": settings.model_version,
        "model_error": model_load_error,
    }


@app.post("/predict")
async def predict(image: UploadFile = File(...)) -> dict[str, object]:
    content_type = (image.content_type or "").lower()
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if content_type not in allowed_types:
        raise HTTPException(
            status_code=415,
            detail={"code": "unsupported_media_type", "message": "Use JPEG, PNG, or WebP."},
        )

    payload = await image.read(settings.max_upload_bytes + 1)
    if len(payload) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=413,
            detail={"code": "file_too_large", "message": "Image exceeds the 10 MB limit."},
        )
    try:
        with Image.open(io.BytesIO(payload)) as image_file:
            image_file.verify()
        with Image.open(io.BytesIO(payload)) as readable:
            width, height = readable.size
            if width < 64 or height < 64:
                raise HTTPException(
                    status_code=422,
                    detail={"code": "image_too_small", "message": "Image must be at least 64 × 64 pixels."},
                )
            image_for_model = readable.convert("RGB")
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError) as exc:
        raise HTTPException(
            status_code=422,
            detail={"code": "invalid_image", "message": "The uploaded file is not a readable image."},
        ) from exc

    try:
        result = model_service.predict(image_for_model)
    except ModelUnavailableError as exc:
        raise HTTPException(
            status_code=503,
            detail={"code": "model_unavailable", "message": str(exc)},
        ) from exc

    return {
        "status": "prediction",
        "model_version": result.model_version,
        "predicted_grade": result.grade,
        "grade_probabilities": result.probabilities,
        "confidence": result.confidence,
        "explainability": {"status": result.explainability_status},
    }
