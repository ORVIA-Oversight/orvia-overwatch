# ORVIA Overwatch open-source integration stack

## Adopted interface layer
- **MapLibre GL JS** (BSD-3-Clause): map rendering for the SENSE integration lab.
- **Traccar** (Apache-2.0): self-hosted tracking/geofence backend. The repository now contains `/api/tracks`, which switches from labelled simulation to live Traccar positions when configured.

## Environment variables for live Traccar
- `TRACCAR_BASE_URL` — e.g. `https://tracking.example.org`
- `TRACCAR_TOKEN` — server API token

No Traccar secret is exposed to the browser; Vercel/server runtime calls Traccar and returns a controlled track contract.

## Next adapters
- **Meshtastic** (GPL-3.0 firmware): integrate as an external field gateway rather than copying firmware into ORVIA.
- **FreeTAKServer** (EPL-2.0): optional TAK interoperability bridge; keep as separate service.
- Both should normalize to the same ORVIA track/event contract used by `/api/tracks`.

## Design rule
The public SENSE page may describe capability only at its verified state. The integration lab labels simulated feeds as simulated and only shows LIVE when a real Traccar adapter responds.
