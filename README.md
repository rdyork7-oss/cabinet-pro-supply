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
7. Add your custom domain (`cabinetprosupply.com` / `www`) in Vercel → Domains.
8. In **Cloudflare DNS**, point only the **web** records (A / CNAME for `@` and `www`) to Vercel as shown in the Vercel domain UI.

### Email / DNS cutover checklist (Cloudflare)

When you remove the old web host, **do not touch email DNS**:

- **Keep** MX records (Cloudflare Email Routing or your mail provider).
- **Keep** related TXT records (SPF, DKIM, DMARC, domain verification).
- **Change only** A/CNAME (and any old host-specific web records) so `@` and `www` resolve to Vercel.
- After cutover, send a test email to `info@cabinetprosupply.com` and confirm web pages and HubSpot forms still load.

Legacy `.html` URLs are redirected in `vercel.json` (301) to the new Astro routes.

## Preview note

Local `astro preview` does **not** apply `vercel.json` redirects. After deploy, verify a few legacy URLs on the live domain (e.g. `/Contractors.html` → `/pros`).
