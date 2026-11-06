import { Globe } from "./components/globe";
import { useVisitorLocations } from "./hooks/use-visitor-locations";

export default function App() {
  const visitors = useVisitorLocations();
  const total = visitors.length;

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
              {total} visitor{total !== 1 ? "s" : ""} right now
            </p>
            <div className="visitor-strip">
              {[...visitors].sort((a, b) => (a.isYou === b.isYou ? 0 : a.isYou ? -1 : 1)).map((v) => (
                <span key={v.id} className={`visitor-tag ${v.isYou ? "you" : ""}`}>
                  <span className={`dot ${v.isYou ? "dot-you" : ""}`} />
                  {v.isYou && "You \u00b7 "}{v.city}, {v.country}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
