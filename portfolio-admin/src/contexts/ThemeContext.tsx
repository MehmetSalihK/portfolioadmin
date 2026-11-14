import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  /* Papier est le thème par défaut — la préférence système n'intervient plus */
  const [theme, setThemeState] = useState<Theme>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    /* Lire AVANT d'écrire : le second effet dépend de `ready` et n'écrit
       dans localStorage qu'une fois la préférence réelle restaurée */
    const savedTheme = localStorage.getItem('portfolio-admin-theme') as Theme;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setThemeState(savedTheme);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;

    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-admin-theme', theme);
  }, [theme, ready]);

  const toggleTheme = () => {
    setThemeState(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;