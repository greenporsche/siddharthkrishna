import { useEffect, useState } from "react";

/** One dot on the globe: recent visits to one site from one place. */
export interface Visitor {
  id: string;
  lat: number;
  lng: number;
  host: string;
  city: string;
  country: string;
  count: number;
}

// The notifier's list of visits from the last few minutes, across all sites.
// On Vercel, /map is rewritten to https://hello.siddharthkrishna.com/map (vercel.json);
// in local dev, Vite proxies it (vite.config.ts).
const MAP_URL = "/map";
const POLL_MS = 5000;

/** Polls the notifier's map feed and returns the current dots. */
export function useVisitorLocations() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(MAP_URL, { cache: "no-store" });
        if (!res.ok) return;
        const dots: Omit<Visitor, "id">[] = await res.json();
        if (cancelled) return;
        setVisitors(dots.map((d) => ({ ...d, id: `${d.host}:${d.lat}:${d.lng}` })));
      } catch {
        // keep the last dots; try again on the next poll
      }
    }

    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return visitors;
}
