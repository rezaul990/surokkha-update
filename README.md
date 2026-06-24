# Kisti Surokkha Dashboard

A standalone Vite + React app that shows the Walton Plaza **Card Status** dashboard
(A/C Created · Printed · Delivered · Delivery Pending · Image Pending) per area / plaza.

Data is fetched live from a Google Sheets published CSV:
`https://docs.google.com/spreadsheets/d/e/2PACX-1vTg-7COh4OQ4p3Ph1qdGWqEYVuErRRaKX5aDbHM_1wtv8dBeHIR2X_cFMBAHeFmKDV2-AyhxjuhhhHJ/pub?output=csv`

## Local development

```bash
npm install
npm run dev      # http://localhost:5174
```

## Production build

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build locally
```

## Deploy to Vercel

1. Push this folder to a Git repo (GitHub / GitLab / Bitbucket).
2. In Vercel, click **Add New → Project** and import the repo.
3. Vercel will auto-detect **Vite**. Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (or `npx vite build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Node.js Version**: 20.x
4. Click **Deploy**.

Your site will be live at `https://<project-name>.vercel.app`.

## Notes

- The CSV parser in `src/utils/dataUtils.js` handles multi-line quoted header
  cells (e.g. `"No. of \nA/C Created"`) correctly.
- To switch the data source, update `CSV_URL` in `src/pages/KistiSurokkha.jsx`.# surokkha-update
