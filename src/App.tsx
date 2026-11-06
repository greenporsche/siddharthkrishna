import { Globe } from "./components/globe";
import { useVisitorLocations } from "./hooks/use-visitor-locations";
import { siteColorCss } from "./site-colors";

export default function App() {
  const visitors = useVisitorLocations();
  const total = visitors.reduce((n, v) => n + v.count, 0);

  return (
    <div className="app">
      <h2 className="greeting">hey, i'm siddharth 👋</h2>

      <main className="main">
        <div className="globe-wrapper">
          <Globe visitors={visitors} />
          <div className="globe-glow" />
        </div>

        {total > 0 && (
          <div className="visitor-footer">
            <p className="visitor-count">
              {total} visit{total !== 1 ? "s" : ""} in the last few minutes
            </p>
            <div className="visitor-strip">
              {visitors.map((v) => (
                <span key={v.id} className="visitor-tag">
                  <span className="dot" style={{ background: siteColorCss(v.host) }} />
                  {v.city}, {v.country}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
