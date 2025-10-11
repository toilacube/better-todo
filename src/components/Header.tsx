import { BarChart3, Moon, Sun, Settings } from 'lucide-react';

interface HeaderProps {
  onStatsClick: () => void;
  onSettingsClick: () => void;
  onThemeToggle: () => void;
  darkMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onStatsClick,
  onSettingsClick,
  onThemeToggle,
  darkMode,
}) => {
  return (
    <header className="header">
      <h1 className="header-title">Todo</h1>
      <div className="header-actions">
        <button
          onClick={onStatsClick}
          className="header-button"
          aria-label="Statistics"
        >
          <BarChart3 size={20} />
        </button>
        <button
          onClick={onThemeToggle}
          className="header-button"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          onClick={onSettingsClick}
          className="header-button"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};
