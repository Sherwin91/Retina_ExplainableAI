# Retina Insight Compass

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

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
