import { BarChart3, Moon, Sun, Settings } from "lucide-react";
import { motion } from "framer-motion";

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
  // Get today's date in dd/mm/yyyy format
  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${today.getFullYear()}`;

  return (
    <motion.header
      className="header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="header-left">
        <h1 className="header-title">TODO</h1>
        <span className="header-date">{formattedDate}</span>
      </div>
      <div className="header-actions">
        <motion.button
          onClick={onStatsClick}
          className="header-button"
          aria-label="Statistics"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <BarChart3 size={24} strokeWidth={1.5} />
        </motion.button>
        <motion.button
          onClick={onThemeToggle}
          className="header-button"
          aria-label="Toggle theme"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          {darkMode ? (
            <Sun size={24} strokeWidth={1.5} />
          ) : (
            <Moon size={24} strokeWidth={1.5} />
          )}
        </motion.button>
        <motion.button
          onClick={onSettingsClick}
          className="header-button"
          aria-label="Settings"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings size={24} strokeWidth={1.5} />
        </motion.button>
      </div>
    </motion.header>
  );
};
