# Utkalika Birthday App

A lightweight single-page web app. Includes performance fixes, lazy-loaded Google Maps, and a minimal Vite build.

## Quick start (Windows PowerShell)

1. Install Node.js (LTS). Then in this folder:

```powershell
npm install
npm run dev
```

2. Build for production:

```powershell
npm run build
npm run preview
```

The app is static and can be hosted on any HTTP server.

## Notable improvements
- Fixed broken JS logic (duplicate showSlide, wrong target id in claimSurprise, safe null checks).
- Deferred heavy media; added lazy image decoding and video preload metadata.
- Lazy-loaded Google Maps only when entering the memory map section.
- CSS fixes: corrected background image path, removed stray comment, valid line-height.
- Small DOM caching and event cleanup already present; preserved and wired up.

## Google Sheets logging
`assets/script.js` uses `WEB_APP_URL`. Replace it with your deployed Apps Script Web App URL if you want logging.
