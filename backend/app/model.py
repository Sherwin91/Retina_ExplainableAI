from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any


class ModelUnavailableError(RuntimeError):
    """Raised when a compatible, configured DR model is not available."""


@dataclass(frozen=True)
class Prediction:
    grade: int
    probabilities: list[float]
    confidence: float
    model_version: str
    explainability_status: str


class ModelService:
    """Explicit model boundary.

    This service intentionally does not guess an architecture from an arbitrary
    checkpoint. A checkpoint is usable only after a project-specific loader is
    implemented with its architecture, preprocessing, and class mapping.
    """

    def __init__(self, checkpoint_path: Path | None, model_version: str) -> None:
        self.checkpoint_path = checkpoint_path
        self.model_version = model_version
        self._model: Any | None = None

    @property
    def available(self) -> bool:
        return self._model is not None

    def load(self) -> None:
        if self.checkpoint_path is None:
            return
        if not self.checkpoint_path.is_file():
            raise ModelUnavailableError(
                f"Configured checkpoint does not exist: {self.checkpoint_path}"
            )
        raise ModelUnavailableError(
            "A checkpoint was configured, but no verified architecture/preprocessing "
            "loader exists for it. Refusing unsafe inference."
        )

    def predict(self, _image: Any) -> Prediction:
        if self._model is None:
            raise ModelUnavailableError(
                "No compatible DR-trained checkpoint is configured. "
                "Train/evaluate a five-class model before enabling inference."
            )
        raise ModelUnavailableError("Inference loader is not implemented for this model.")
