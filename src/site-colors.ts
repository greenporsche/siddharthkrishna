type RGB = [number, number, number];

// Distinct, bright colors that read on the dark globe.
const PALETTE: RGB[] = [
  [0.3, 0.7, 1], // blue
  [0.2, 1, 0.5], // green
  [1, 0.55, 0.2], // orange
  [1, 0.35, 0.6], // pink
  [0.75, 0.5, 1], // violet
  [1, 0.9, 0.3], // yellow
  [0.3, 1, 0.95], // cyan
  [1, 0.3, 0.3], // red
];

/** The same site always gets the same color (no legend on the page). */
export function siteColor(host: string): RGB {
  const site = host.replace(/^www\./, "");
  let h = 0;
  for (const ch of site) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function siteColorCss(host: string): string {
  const [r, g, b] = siteColor(host).map((c) => Math.round(c * 255));
  return `rgb(${r}, ${g}, ${b})`;
}
