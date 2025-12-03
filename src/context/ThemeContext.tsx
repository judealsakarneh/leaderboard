import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type ThemeName = "thunder" | "volcano" | "slots" | "bowling";

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  cycleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const themes: ThemeName[] = ["thunder", "volcano", "slots", "bowling"];

type Props = { children: ReactNode };

export const ThemeProvider: React.FC<Props> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>("thunder");

  // Auto-cycle themes every 2 minutes
  useEffect(() => {
    const id = setInterval(() => {
      setThemeState((prev) => {
        const idx = themes.indexOf(prev);
        return themes[(idx + 1) % themes.length];
      });
    }, 120000);
    return () => clearInterval(id);
  }, []);

  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => {
      const idx = themes.indexOf(prev);
      return themes[(idx + 1) % themes.length];
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
};
