# EyeCare inference API

This service is deliberately fail-closed. The repository contains no verified
DR-trained checkpoint, architecture definition, preprocessing metadata, or
evaluation report, so `POST /predict` returns `503 model_unavailable` rather
than inventing a result.

## Run locally

```sh
cd backend
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Set these environment variables before starting:

- `EYECARE_CHECKPOINT_PATH`: path to a reviewed five-class DR checkpoint.
- `EYECARE_MODEL_VERSION`: version recorded with the checkpoint.
- `EYECARE_FRONTEND_ORIGINS`: comma-separated allowed browser origins.
- `EYECARE_MAX_UPLOAD_BYTES`: optional upload limit, default `10485760`.

The current model loader intentionally rejects every checkpoint until its
architecture, preprocessing, class mapping, and evaluation are wired and
reviewed in `backend/app/model.py`.
