"use client";

import React, { createContext, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import muiTheme from "@/config/theme/theme";
import palettes from "@/config/theme/palettes";

export const ThemeSwitcherContext = createContext();

export const THEMES = {
  dark: "dark",
  light: "light",
};

export const THEME_COOKIE = "devsignal-theme";

function ThemeSwitcherContextProvider({ children }) {
  const [theme, setThemeState] = useState(THEMES.dark);

  const selectedPalette = palettes[theme] || palettes[THEMES.dark];
  const mergedTheme = useMemo(
    () => createTheme({ ...muiTheme, palette: selectedPalette }),
    [selectedPalette]
  );

  const changeTheme = (nextTheme) => {
    if (!palettes[nextTheme]) return;
    setThemeState(nextTheme);
    if (typeof document !== "undefined") {
      document.cookie = `${THEME_COOKIE}=${nextTheme};path=/;max-age=31536000;samesite=lax`;
    }
  };

  const toggleTheme = () => {
    changeTheme(theme === THEMES.dark ? THEMES.light : THEMES.dark);
  };

  return (
    <ThemeSwitcherContext.Provider value={{ theme, setTheme: changeTheme, toggleTheme }}>
      <ThemeProvider theme={mergedTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeSwitcherContext.Provider>
  );
}

export default ThemeSwitcherContextProvider;
