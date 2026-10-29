# EyeCare — Retina Insight Compass

Build a polished, professional healthcare AI web application called EyeCare for explainable diabetic retinopathy screening in rural India.

TECH STACK:

React, TypeScript, Vite, Tailwind CSS

Responsive desktop and mobile layouts

Reusable, maintainable components

DESIGN:

Modern clinical dashboard, white background, deep navy typography, teal accents

Sidebar navigation and clean cards

Accessible fonts, clear status indicators, professional medical UI

PAGES:

Dashboard with screening statistics and recent screening activity.

New Screening page with retinal fundus image drag-and-drop upload, image preview, file validation, and Analyze button.

Results page with five DR grades: No DR, Mild, Moderate, Severe, Proliferative DR.

Explainability page with a Grad-CAM heatmap image overlay and opacity slider.

Screening history page with search and filters.

About page explaining the project and its limitations.

FUNCTIONAL REQUIREMENTS:

Make navigation and image preview work.

Validate image file types and sizes.

Use clearly marked mock data only until a real model backend is connected.

Never show fake predictions as actual medical results.

Create a modular API service for a future FastAPI backend at /predict.

Show loading, error, and success states.

Do not require real patient names or other personal information.

Do not add a paid external AI API dependency.

Include a medical research prototype disclaimer and referral guidance placeholder.

Generate the complete working frontend, then run the available checks and fix errors. Keep the code easy to run locally in VS Code.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://retina-insight-compass.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ea1e7683-4c50-45dc-9bdb-ee0d4f99fa66).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Architecture

- **Frontend:** React, TypeScript, Vite, and TanStack Router under `src/`.
- **API client:** `src/services/predict.ts`, using `VITE_PREDICT_API_URL`.
- **Backend:** FastAPI under `backend/`, with Pillow upload validation and a
  fail-closed model service.
- **Training scaffold:** `training/train.py`, designed for a documented,
  patient-grouped five-class retinal dataset.
- **Model contract:** [MODEL_CARD.md](./MODEL_CARD.md).

The backend does not retain uploaded images. The frontend creates an in-memory
object URL for preview and the API processes the request without writing the
upload to disk.

## Prerequisites

- Node.js and npm for the frontend.
- Python 3.12 recommended for the backend.
- A legally obtained retinal dataset and a reviewed five-class checkpoint are
  required before real inference can be enabled.

## Frontend setup and startup

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
cd retina-insight-compass
npm install
npm run dev
```

The frontend runs in explicit demo mode when `VITE_PREDICT_API_URL` is unset.
Demo uploads do not produce a grade, confidence, probabilities, or heatmap.

To connect a reviewed backend:

```sh
cp .env.example .env.local
```

Set:

```env
VITE_PREDICT_API_URL=http://localhost:8000
```

## Backend setup and startup

```sh
cd backend
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Backend environment variables:

- `EYECARE_CHECKPOINT_PATH`: reviewed five-class checkpoint path.
- `EYECARE_MODEL_VERSION`: version identifier shown in API responses.
- `EYECARE_FRONTEND_ORIGINS`: comma-separated allowed origins; defaults to
  `http://localhost:5173,http://127.0.0.1:5173`.
- `EYECARE_MAX_UPLOAD_BYTES`: optional limit, default `10485760`.

### API contract

`GET /health` reports application status separately from model readiness:

```json
{
  "status": "ok",
  "model_status": "unavailable",
  "model_version": "unavailable",
  "model_error": null
}
```

`POST /predict` accepts a multipart field named `image`. With no compatible
checkpoint it returns `503` and never invents a result:

```json
{
  "detail": {
    "code": "model_unavailable",
    "message": "No compatible DR-trained checkpoint is configured..."
  }
}
```

When a verified model is implemented, a successful response will contain:

```json
{
  "status": "prediction",
  "model_version": "reviewed-version",
  "predicted_grade": 0,
  "grade_probabilities": [0.0, 0.0, 0.0, 0.0, 0.0],
  "confidence": 0.0,
  "explainability": {"status": "unavailable"}
}
```

The values above are schema examples only, not model output or clinical metrics.

## Testing

Frontend:

```sh
npm run lint
npm run test
npm run build
```

Backend, from the `backend` directory:

```sh
.venv/bin/python -m pytest tests -q
```

The backend tests cover health reporting, unsupported formats, corrupt images,
missing fields, oversized uploads, and fail-closed behavior without a model.

## Model status and limitations

No trained diabetic-retinopathy checkpoint was present in the audited repository.
The FastAPI service therefore fails closed with
`model_unavailable` until a compatible five-class checkpoint is reviewed.

No training, held-out evaluation, clinical validation, or Grad-CAM verification
has been completed. See [`backend/README.md`](./backend/README.md),
[`training/README.md`](./training/README.md), and
[`MODEL_CARD.md`](./MODEL_CARD.md) for the current blockers and workflow.

## Demonstration screenshots

These screenshots were captured from the locally running application and API:

- [Dashboard](./docs/screenshots/dashboard.png)
- [New screening upload](./docs/screenshots/screening.png)
- [Model-unavailable results state](./docs/screenshots/results-model-unavailable.png)
- [Backend health response](./docs/screenshots/backend-health.png)
- [Current model loader](./docs/screenshots/model-loader.png)
# Retina_ExplainableAI
