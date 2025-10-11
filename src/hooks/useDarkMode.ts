import { useEffect } from 'react';

export const useDarkMode = (darkMode: boolean) => {
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
};
