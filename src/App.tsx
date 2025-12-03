import React, { useState } from "react";
import "./App.css";
import { AgentsProvider } from "./context/AgentsContext";
import { DisplayScreen } from "./screens/DisplayScreen";
import { AdminPanel } from "./components/AdminPanel";
import { NotificationStack } from "./components/NotificationStack";

const AppShell: React.FC = () => {
  const [view, setView] = useState<"display" | "admin">("display");

  return (
    <div className="app-root">
      <div className="bg-layer" />
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
    <AgentsProvider>
      <AppShell />
    </AgentsProvider>
  );
};

export default App;
