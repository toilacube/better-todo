import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import {
  getCurrentWeekId,
  getWeekDisplayString,
  getPreviousWeek,
  getNextWeek,
  isFutureWeek,
} from "../utils/weekHelpers";

interface WeekNavigatorProps {
  currentWeekId: string;
  onWeekChange?: (weekId: string) => void;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  currentWeekId,
  onWeekChange,
}) => {
  const actualCurrentWeek = getCurrentWeekId();
  const isCurrentWeek = currentWeekId === actualCurrentWeek;
  const nextWeekId = getNextWeek(currentWeekId);
  const isNextFuture = isFutureWeek(nextWeekId);

  const handlePrevious = () => {
    if (onWeekChange) {
      onWeekChange(getPreviousWeek(currentWeekId));
    }
  };

  const handleNext = () => {
    if (onWeekChange && !isNextFuture) {
      onWeekChange(nextWeekId);
    }
  };

  const handleGoToCurrentWeek = () => {
    if (onWeekChange && !isCurrentWeek) {
      onWeekChange(actualCurrentWeek);
    }
  };

  return (
    <motion.div
      className="week-navigator"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <motion.button
        onClick={handlePrevious}
        className="week-nav-button"
        aria-label="Previous week"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
      </motion.button>

      <div className="week-display">
        <span className="week-label">{getWeekDisplayString(currentWeekId)}</span>
        {!isCurrentWeek && (
          <span className="week-status">Historical</span>
        )}
      </div>

      <motion.button
        onClick={handleNext}
        className="week-nav-button"
        disabled={isNextFuture}
        aria-label="Next week"
        whileHover={!isNextFuture ? { scale: 1.05 } : {}}
        whileTap={!isNextFuture ? { scale: 0.95 } : {}}
        style={{ opacity: isNextFuture ? 0.3 : 1 }}
      >
        <ChevronRight size={20} strokeWidth={1.5} />
      </motion.button>

      {!isCurrentWeek && (
        <motion.button
          onClick={handleGoToCurrentWeek}
          className="current-week-button"
          aria-label="Go to current week"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Calendar size={18} strokeWidth={1.5} />
          <span>Current Week</span>
        </motion.button>
      )}
    </motion.div>
  );
};
