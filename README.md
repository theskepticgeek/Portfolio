# Krrobius — Next.js

Next.js App Router conversion of the original standalone Three.js/canvas experiment.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Structure

- `app/page.js` — home route
- `app/layout.js` — metadata and root layout
- `app/globals.css` — full-screen canvas layering
- `components/KrrobiusScene.jsx` — Three.js Möbius strip, shaders, vector field, pointer interaction, animation loop, and cleanup

## Notes

The scene remains a raw Three.js implementation rather than React Three Fiber, so the existing visuals and physics stay as close as possible to the original source. `three` is pinned to `0.128.0`, matching the version previously loaded by the HTML import map.
