# Financial Document Analyzer Frontend

React + Vite + Bootstrap UI for uploading a financial PDF and requesting analysis from the FastAPI backend.

## Prerequisites

- Node.js 18+
- npm 9+

## Environment

Create a `.env` file in `client/` (or copy from `.env.example`):

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_API_ANALYZE_PATH=/analyze
```

Notes:
- In `npm run dev`, you can keep `VITE_API_BASE_URL` empty to use Vite proxy.
- In `npm run serve` (preview) or deployed frontend, set `VITE_API_BASE_URL` to your backend URL.
- If `VITE_API_BASE_URL` is empty in non-dev mode, the app falls back to `http://127.0.0.1:8000`.

## Install And Run

```sh
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Build For Production

```sh
npm run build
npm run serve
```

Preview server runs the production bundle from `dist/`.

## Functional Check

1. Open `http://localhost:5173`.
2. Upload a PDF document.
3. Keep or edit the analysis query.
4. Click `Analyze Document`.
5. Confirm response JSON is shown in `Analysis Result`.