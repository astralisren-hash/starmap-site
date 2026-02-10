nano codex/site/RELEASE-CHECKLIST.md

## Preflight
- [ ] `npm run release`
- [ ] Badge shows:
      `✅ Surfaces(0/0) · ✅ Tiers(0) · ✅ Tags(0)`
- [ ] `cat codex/site/release-status.json` looks correct (stable true)

## Build Artifact
- [ ] `npm run build`
- [ ] Verify: `ls dist | head` includes `index.html` and `_astro/`

## Upload Package (mobile-safe)
- [ ] Create zip from dist contents:
      `cd dist && zip -r ../starmap-upload.zip . && cd ..`
- [ ] Copy to shared storage:
      `cp starmap-upload.zip ~/storage/shared/`

## Deploy (Cloudflare Pages)
- [ ] Pages → starmap-direct-site → Deployments → New deployment
- [ ] Upload `starmap-upload.zip`

## Post-deploy verification
- [ ] `https://www.starmap.direct` loads
- [ ] `https://starmap.direct` redirects to `https://www.starmap.direct`
- [ ] Trailing slash normalizes:
      `/walk` → `/walk/`
- [ ] Spot-check key routes:
      `/arrival/`, `/seed/`, `/current-sky/`, `/edge/`

## Record
- [ ] Note timestamp + badge line in log (optional):
      `codex/site/release-log.md`
