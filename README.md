# siddharthkrishna.com

The globe at www.siddharthkrishna.com. It shows visits to any of the sites from
the last few minutes, one dot per place, colored by site.

- The dots come from the visitor notifier's public feed,
  `https://hello.siddharthkrishna.com/map`. The page reads it as `/map` and
  checks again every 5 seconds. `vercel.json` forwards `/map` there.
- The page reports its own visits to the notifier through `/v` (the line in
  `index.html`). `vercel.json` forwards `/v` too.

## Run locally

```
npm install
npm run dev
```

Local dev shows the live dots (Vite forwards `/map`). Local page loads send no
alerts, because `/v` isn't forwarded locally.

## Build

```
npm run build
```

Vercel builds with the same command and serves `dist/`.
