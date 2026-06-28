# Landing Page

The marketing landing page for the WhatsApp AI Automation project. Built with **React + Vite + TypeScript + Tailwind CSS**, styled in a clean, Apple-inspired light theme. Fully self-contained (no external fonts, images, or scripts).

## Local development

```bash
cd landing
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Deploy to Vercel (1 minute)

Because this lives in a subfolder of the main repo, point Vercel at it:

1. Go to [vercel.com/new](https://vercel.com/new) and **import** the GitHub repo.
2. When Vercel asks, set **Root Directory** to `landing`.
3. Framework preset auto-detects as **Vite**. Leave the defaults:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click **Deploy**. Done — every push to `main` redeploys automatically.

> Tip: after the first deploy, copy the live URL and paste it into your GitHub repo's **About → Website** field so visitors find it.
