import React, { useState } from "react";
import "./App.css";
import "./styles/effects.css";
import { AgentsProvider } from "./context/AgentsContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { DisplayScreen } from "./screens/DisplayScreen";
import { AdminPanel } from "./components/AdminPanel";
import { NotificationStack } from "./components/NotificationStack";
import {
  ThunderBackground,
  VolcanoBackground,
  SlotsBackground,
  BowlingBackground,
} from "./components/VisualEffects";

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const themes = ["thunder", "volcano", "slots", "bowling"] as const;

  return (
    <div className="theme-selector">
      {themes.map((t) => (
        <button
          key={t}
          className={`theme-btn ${t} ${theme === t ? "active" : ""}`}
          onClick={() => setTheme(t)}
        >
          {t === "thunder" && "⚡"}
          {t === "volcano" && "🌋"}
          {t === "slots" && "🎰"}
          {t === "bowling" && "🎳"}
        </button>
      ))}
    </div>
  );
};

const ThemeBackgrounds: React.FC = () => (
  <>
    <ThunderBackground />
    <VolcanoBackground />
    <SlotsBackground />
    <BowlingBackground />
  </>
);

const AppShell: React.FC = () => {
  const [view, setView] = useState<"display" | "admin">("display");

  return (
    <div className="app-root">
      <div className="bg-layer" />
      <ThemeBackgrounds />
      <header className="app-header">
        <div className="header-left">
          <button
            className="admin-button"
            onClick={() =>
              setView((prev) => (prev === "display" ? "admin" : "display"))
            }
          >
            {view === "display" ? "Admin" : "Back"}
          </button>
          <div className="brand">
            <div className="brand-mark">RA</div>
            <div className="brand-text">
              <div className="brand-title">Retention Arena</div>
              <div className="brand-subtitle">Floor broadcast</div>
            </div>
          </div>
        </div>
        {view === "display" && <ThemeSelector />}
      </header>

      <main className="app-main">
        {view === "display" ? <DisplayScreen /> : <AdminPanel />}
      </main>

      <NotificationStack />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AgentsProvider>
        <AppShell />
      </AgentsProvider>
    </ThemeProvider>
  );
};

export default App;
