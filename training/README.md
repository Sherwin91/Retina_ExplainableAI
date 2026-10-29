# EyeCare model training workflow

No trained diabetic-retinopathy checkpoint is included in this repository. The
frontend and API therefore refuse to present predictions until a compatible
model has been trained and evaluated.

## Required inputs

Use a legally obtained, documented retinal dataset such as APTOS 2019, subject
to its terms of use. Keep the dataset outside this repository. The labels must
be the five-class mapping used by EyeCare:

`0 No DR`, `1 Mild`, `2 Moderate`, `3 Severe`, `4 Proliferative DR`.

The training run must record the exact image resolution, RGB normalization,
architecture, class mapping, split strategy, seed, dependency lockfile, and
held-out metrics. Do not use an ImageNet-only checkpoint as a DR classifier.

## Reproducible workflow

1. Create a Python 3.12 virtual environment.
2. Install a pinned training stack appropriate for the available hardware.
3. Download the dataset manually after reviewing its terms.
4. Create patient-disjoint train/validation/test splits.
5. Prepare a CSV with `image`, `diagnosis`, and `patient_id` columns. The
   included script uses grouped train/validation/test splits and refuses a CSV
   without patient identifiers.
6. Fine-tune a documented five-class architecture with class imbalance handling.
7. Evaluate once on the held-out test split and save the model metadata next to
   the checkpoint.
8. Implement and test the matching loader in `backend/app/model.py`.
9. Set `EYECARE_CHECKPOINT_PATH` and `EYECARE_MODEL_VERSION` only after review.

The scaffold can be invoked after installing
`training/requirements.txt`:

```sh
python training/train.py \
  --csv /path/to/metadata.csv \
  --image-root /path/to/images \
  --output /path/to/checkpoints/eyecare-mobilenet-v3-small.pt
```

It records architecture and preprocessing metadata but does not calculate
held-out metrics or make the checkpoint production-ready by itself.

This repository does not claim that training, accuracy, or clinical validation
has been completed.
