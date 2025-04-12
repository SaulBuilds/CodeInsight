import { useState, useEffect } from "react";

type ThemeMode = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(
    () => (localStorage.getItem("theme") as ThemeMode) || "system"
  );
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Update theme based on system preference or stored value
  useEffect(() => {
    const updateTheme = () => {
      const root = window.document.documentElement;
      
      // Determine if dark mode should be applied
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldApplyDark = 
        theme === "dark" || 
        (theme === "system" && systemPrefersDark);
      
      // Apply the appropriate theme
      if (shouldApplyDark) {
        root.classList.add("dark");
        setIsDarkMode(true);
      } else {
        root.classList.remove("dark");
        setIsDarkMode(false);
      }
    };
    
    updateTheme();
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => updateTheme();
    mediaQuery.addEventListener("change", listener);
    
    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme]);
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };
  
  // Set a specific theme
  const setThemeMode = (mode: ThemeMode) => {
    setTheme(mode);
    localStorage.setItem("theme", mode);
  };
  
  return {
    theme,
    isDarkMode,
    toggleTheme,
    setTheme: setThemeMode,
  };
}
