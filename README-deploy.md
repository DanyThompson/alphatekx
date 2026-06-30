# Free deployment options without a card

## Option 1 — GitHub Pages (best free option)

This project now includes a GitHub Actions workflow that publishes the frontend to GitHub Pages for free.

### Steps
1. Push the repo to GitHub.
2. In the repository settings, enable GitHub Pages.
3. In Settings → Secrets and variables → Actions, add:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_PAYSTACK_PUBLIC_KEY
4. Merge to main or run the workflow manually.
5. Your site will be published at:
   https://<your-github-user>.github.io/<repo-name>/

## Option 2 — Cloudflare Pages (free)

Cloudflare Pages also offers free hosting and does not require a card for the basic tier.

## Option 3 — Render / Railway free tier

These may require a card during signup, so I would avoid them if you want a strict no-card route.

## Important note

The frontend can be hosted for free, but the backend features still depend on Supabase and your Supabase auth redirect URLs.
