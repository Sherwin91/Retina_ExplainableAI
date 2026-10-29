from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    checkpoint_path: Path | None
    model_version: str
    max_upload_bytes: int
    allowed_origins: tuple[str, ...]


def load_settings() -> Settings:
    checkpoint = os.getenv("EYECARE_CHECKPOINT_PATH", "").strip()
    origins = os.getenv(
        "EYECARE_FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )
    return Settings(
        checkpoint_path=Path(checkpoint) if checkpoint else None,
        model_version=os.getenv("EYECARE_MODEL_VERSION", "unavailable"),
        max_upload_bytes=int(os.getenv("EYECARE_MAX_UPLOAD_BYTES", str(10 * 1024 * 1024))),
        allowed_origins=tuple(origin.strip() for origin in origins.split(",") if origin.strip()),
    )
