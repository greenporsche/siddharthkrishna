import { useEffect, useRef, useState } from "react";

export interface Visitor {
  id: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  isYou: boolean;
}

function getWsUrl() {
  const envUrl = import.meta.env.VITE_WS_URL;
  if (envUrl) return envUrl;

  // Fallback for local dev
  const isSecure = window.location.protocol === "https:";
  const host = window.location.hostname || "localhost";
  return `${isSecure ? "wss" : "ws"}://${host}:3001`;
}

interface GeoResult {
  lat: number;
  lng: number;
  city: string;
  country: string;
}

let geoCache: GeoResult | null = null;
let geoPromise: Promise<GeoResult | null> | null = null;

/**
 * Fetches geolocation once and caches it for the session.
 * Tries multiple free APIs as fallbacks.
 */
function fetchGeo(): Promise<GeoResult | null> {
  if (geoCache) return Promise.resolve(geoCache);
  if (geoPromise) return geoPromise;

  geoPromise = (async () => {
    const apis = [
      {
        url: "https://ip-api.com/json/?fields=lat,lon,city,countryCode",
        parse: (d: Record<string, unknown>) => ({
          lat: d.lat as number,
          lng: d.lon as number,
          city: (d.city as string) ?? "Unknown",
          country: (d.countryCode as string) ?? "??",
        }),
      },
      {
        url: "https://ipapi.co/json/",
        parse: (d: Record<string, unknown>) => ({
          lat: d.latitude as number,
          lng: d.longitude as number,
          city: (d.city as string) ?? "Unknown",
          country: (d.country_code as string) ?? "??",
        }),
      },
    ];

    for (const api of apis) {
      try {
        const res = await fetch(api.url);
        if (!res.ok) continue;
        const data = await res.json();
        const result = api.parse(data);
        if (typeof result.lat === "number" && typeof result.lng === "number") {
          geoCache = result;
          return result;
        }
      } catch {
        continue;
      }
    }
    return null;
  })();

  return geoPromise;
}

/**
 * Connects to the presence WebSocket server, sends this visitor's
 * real IP-based geolocation, and receives all active visitors in real time.
 */
export function useVisitorLocations() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const myIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let socket: WebSocket | null = null;

    function connect() {
      const ws = new WebSocket(getWsUrl());
      socket = ws;

      ws.onopen = async () => {
        const geo = await fetchGeo();
        if (cancelled || ws.readyState !== WebSocket.OPEN) return;
        if (geo) {
          ws.send(
            JSON.stringify({
              type: "location",
              lat: geo.lat,
              lng: geo.lng,
              city: geo.city,
              country: geo.country,
            })
          );
        }
      };

      ws.onmessage = (e) => {
        if (cancelled) return;
        try {
          const msg = JSON.parse(e.data);

          if (msg.type === "welcome") {
            myIdRef.current = msg.yourId;
            setVisitors(
              msg.visitors.map((v: Visitor) => ({
                ...v,
                isYou: v.id === msg.yourId,
              }))
            );
          }

          if (msg.type === "visitors") {
            setVisitors(
              msg.visitors.map((v: Visitor) => ({
                ...v,
                isYou: v.id === myIdRef.current,
              }))
            );
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (!cancelled) {
          reconnectTimer = setTimeout(connect, 2000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  return visitors;
}
