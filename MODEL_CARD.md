# EyeCare model card

## Status

**No trained model is included or verified.** The inference API intentionally
returns `503 model_unavailable` until a checkpoint with the metadata below is
reviewed. No accuracy, sensitivity, specificity, or clinical validation is
claimed.

## Intended use

EyeCare is a research prototype for investigating explainable diabetic
retinopathy screening workflows in rural India. It is not a medical device and
must not be used for diagnosis, triage, or treatment decisions.

## Required model specification

These fields are requirements for a future model; they are not claims about a
current model:

- **Architecture:** a documented five-class image classifier, with the exact
  implementation and version recorded alongside the checkpoint.
- **Checkpoint location:** not present. Configure `EYECARE_CHECKPOINT_PATH`
  only after provenance and compatibility review.
- **Dataset:** a legally obtained retinal dataset, such as APTOS 2019 subject
  to its terms of use. Dataset version, license, and source must be recorded.
- **Classes:** `0 No DR`, `1 Mild`, `2 Moderate`, `3 Severe`,
  `4 Proliferative DR`.
- **Input:** one readable colour fundus image per upload; JPEG, PNG, or WebP;
  maximum 10 MB at the API boundary.
- **Preprocessing:** not yet confirmed. The final model card must record resize,
  crop policy, RGB channel order, scaling, and normalization constants.
- **Inference:** CPU by default, evaluation mode, no silent weight downloads.
- **Output:** five finite probabilities, their predicted class, model version,
  and explicit explainability availability.
- **Grad-CAM target layer:** not verified. No heatmap is returned currently.

## Training and evaluation

Training has **not** run in this repository. A future run must use a documented
dataset split, patient-level grouping where identifiers exist, a fixed seed,
class-imbalance handling, and a held-out test set. Metrics must be measured and
recorded by the training run; none are available today.

See [`training/README.md`](./training/README.md) and
[`training/train.py`](./training/train.py) for the guarded workflow scaffold.

## Limitations

Fundus image quality, camera variation, population shift, disease prevalence,
and label uncertainty can materially affect performance. Attention maps, when
eventually implemented and tested, will indicate model attention and will not
constitute proof of clinical reasoning.
