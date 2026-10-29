"""Guarded five-class DR fine-tuning entry point.

This script is intentionally not run automatically and does not download data
or pretrained weights. It expects a project-owned CSV with image, diagnosis,
and patient_id columns so an accidental image-level split cannot be mistaken
for a leakage-safe evaluation.
"""

from __future__ import annotations

import argparse
import csv
import json
import random
from pathlib import Path
from typing import Any

import torch
from PIL import Image
from sklearn.model_selection import GroupShuffleSplit
from torch import nn
from torch.utils.data import DataLoader, Dataset
from torchvision import models, transforms

CLASS_NAMES = ("No DR", "Mild", "Moderate", "Severe", "Proliferative DR")
IMAGE_SIZE = 224
MEAN = (0.485, 0.456, 0.406)
STD = (0.229, 0.224, 0.225)


class RetinalDataset(Dataset[tuple[torch.Tensor, int]]):
    def __init__(self, rows: list[dict[str, str]], root: Path, transform: Any) -> None:
        self.rows = rows
        self.root = root
        self.transform = transform

    def __len__(self) -> int:
        return len(self.rows)

    def __getitem__(self, index: int) -> tuple[torch.Tensor, int]:
        row = self.rows[index]
        with Image.open(self.root / row["image"]) as image:
            image = image.convert("RGB")
            return self.transform(image), int(row["diagnosis"])


def read_rows(csv_path: Path) -> list[dict[str, str]]:
    with csv_path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    required = {"image", "diagnosis", "patient_id"}
    if not rows or not required.issubset(rows[0]):
        raise ValueError("CSV must contain image, diagnosis, and patient_id columns.")
    for row in rows:
        label = int(row["diagnosis"])
        if label not in range(5):
            raise ValueError("diagnosis values must be exactly 0, 1, 2, 3, or 4.")
    return rows


def split_rows(rows: list[dict[str, str]], seed: int) -> tuple[list[dict[str, str]], list[dict[str, str]], list[dict[str, str]]]:
    indices = list(range(len(rows)))
    groups = [row["patient_id"] for row in rows]
    first, test = next(GroupShuffleSplit(n_splits=1, test_size=0.15, random_state=seed).split(indices, groups=groups))
    train_indices = [indices[index] for index in first]
    remaining_groups = [groups[index] for index in train_indices]
    train_local, validation_local = next(
        GroupShuffleSplit(n_splits=1, test_size=0.1765, random_state=seed).split(
            train_indices, groups=remaining_groups
        )
    )
    train = [rows[train_indices[index]] for index in train_local]
    validation = [rows[train_indices[index]] for index in validation_local]
    held_out = [rows[index] for index in test]
    return train, validation, held_out


def make_model() -> nn.Module:
    model = models.mobilenet_v3_small(weights=None)
    model.classifier[-1] = nn.Linear(model.classifier[-1].in_features, len(CLASS_NAMES))
    return model


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", type=Path, required=True)
    parser.add_argument("--image-root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    random.seed(args.seed)
    torch.manual_seed(args.seed)
    rows = read_rows(args.csv)
    train_rows, validation_rows, test_rows = split_rows(rows, args.seed)
    transform = transforms.Compose(
        [transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)), transforms.ToTensor(), transforms.Normalize(MEAN, STD)]
    )
    model = make_model().to("cpu")
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4)
    loss_fn = nn.CrossEntropyLoss()
    train_loader = DataLoader(RetinalDataset(train_rows, args.image_root, transform), batch_size=args.batch_size, shuffle=True)
    model.train()
    for _epoch in range(args.epochs):
        for images, labels in train_loader:
            optimizer.zero_grad()
            loss_fn(model(images), labels).backward()
            optimizer.step()

    args.output.parent.mkdir(parents=True, exist_ok=True)
    torch.save({"state_dict": model.state_dict(), "classes": CLASS_NAMES}, args.output)
    metadata = {
        "architecture": "torchvision.mobilenet_v3_small",
        "classes": CLASS_NAMES,
        "image_size": IMAGE_SIZE,
        "mean": MEAN,
        "std": STD,
        "seed": args.seed,
        "split_counts": {"train": len(train_rows), "validation": len(validation_rows), "test": len(test_rows)},
        "evaluation": "Not implemented by this scaffold; evaluate the held-out test split before serving.",
    }
    args.output.with_suffix(".json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
