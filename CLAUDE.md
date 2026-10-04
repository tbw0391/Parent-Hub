# Notes for Claude

## Production deploys need "cleared hot"

Pushing or merging to `main` deploys to production (Vercel). Do it only
after the user says the exact phrase **"cleared hot"** for that deploy.
Anything else ("yes", "go", "push to prod", "ship it") is not clearance:
ask "Cleared hot?" and wait. Clearance covers one deploy; ask again for
the next one. Feature branches can be pushed any time.
