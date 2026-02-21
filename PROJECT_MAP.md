# StarMap Project Map

## Repos
- Site (Astro UI): ~/projects/starmap-site
- Canon (truth):   ~/starmap (symlinked into site as ./starmap)

## Architecture
- Routes: src/pages (thin stubs)
- Zones:  src/zones (actual page bodies)
  - entry/  world/  system/  ops/  codex/
- Layouts: src/layouts (SkyLayout, Base)
- Canon:   starmap/registry + starmap/codex

## Ground rules
- Do not put real content/logic in src/pages stubs
- SkyLayout = public world
- Base = operator tools
- Registry defines what exists in Codex
