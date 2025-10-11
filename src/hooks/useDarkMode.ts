import { useEffect } from 'react';

export const useDarkMode = (darkMode: boolean) => {
  useEffect(() => {
    // Use data-theme attribute instead of class for new design system
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);
};
