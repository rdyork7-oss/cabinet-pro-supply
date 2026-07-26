# Cabinet Pro Supply

Wholesale American cabinetry marketing site, built with [Astro](https://astro.build) and Tailwind CSS.

## Local development

```bash
npm install
npm run dev
```

Open the URL Astro prints (usually `http://localhost:4321`).

## Build

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Framework preset: **Astro** (auto-detected).
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.
7. Add your custom domain (`cabinetprosupply.com`) in Vercel → Domains, then update DNS at GoDaddy.

Keep GoDaddy **email MX records** intact when changing DNS. Only update A/CNAME records Vercel shows you.
