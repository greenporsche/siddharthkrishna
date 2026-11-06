import { useEffect, useRef, useCallback, useMemo } from "react";
import createGlobe from "cobe";
import type { Visitor } from "../hooks/use-visitor-locations";

interface GlobeProps {
  visitors: Visitor[];
  className?: string;
}

/**
 * Persistent rotation state kept outside React so it survives
 * globe re-creation when the visitor list changes.
 */
const rotation = { phi: 0, pointerPhi: 0 };

export function Globe({ visitors, className }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const widthRef = useRef(0);

  const markers = useMemo(
    () =>
      visitors.map((v) => ({
        location: [v.lat, v.lng] as [number, number],
        size: v.isYou ? 0.08 : 0.05,
        color: v.isYou
          ? ([0.2, 1, 0.5] as [number, number, number])
          : ([0.3, 0.7, 1] as [number, number, number]),
      })),
    [visitors]
  );

  // Stable string key so the effect re-runs when markers actually change
  const markersKey = useMemo(
    () => visitors.map((v) => `${v.id}:${v.lat}:${v.lng}`).join(","),
    [visitors]
  );

  // Auto-focus on the first visitor once
  const hasAutoFocused = useRef(false);
  if (visitors.length > 0 && !hasAutoFocused.current) {
    const first = visitors[0];
    rotation.phi =
      (((-first.lng - 90) * Math.PI) / 180) % (2 * Math.PI);
    hasAutoFocused.current = true;
  }

  const onResize = useCallback(() => {
    if (canvasRef.current) {
      widthRef.current = canvasRef.current.offsetWidth;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", onResize);
    onResize();

    if (!canvasRef.current || widthRef.current === 0) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      phi: rotation.phi,
      theta: 0.25,
      dark: 1,
      diffuse: 3,
      mapSamples: 32000,
      mapBrightness: 7,
      baseColor: [0.15, 0.15, 0.2],
      markerColor: [0.4, 0.8, 1],
      glowColor: [0.1, 0.1, 0.2],
      markers,
      onRender: (state) => {
        if (!pointerInteracting.current) {
          rotation.phi += 0.003;
        }
        state.phi = rotation.phi + rotation.pointerPhi;
        state.width = widthRef.current * 2;
        state.height = widthRef.current * 2;
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
    // Re-create the globe when marker data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onResize, markersKey]);

  return (
    <div className={`globe-container ${className ?? ""}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current =
            e.clientX - rotation.pointerPhi;
          canvasRef.current!.style.cursor = "grabbing";
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          canvasRef.current!.style.cursor = "grab";
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          canvasRef.current!.style.cursor = "grab";
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            rotation.pointerPhi =
              (e.clientX - pointerInteracting.current) / 200;
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            rotation.pointerPhi =
              (e.touches[0].clientX - pointerInteracting.current) / 100;
          }
        }}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          contain: "layout paint size",
          aspectRatio: "1",
        }}
      />
    </div>
  );
}
