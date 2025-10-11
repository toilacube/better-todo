import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsType } from "../types";
import { useAutostart } from "../hooks/useAutostart";

interface SettingsProps {
  isOpen: boolean;
  settings: SettingsType;
  onClose: () => void;
  onUpdate: (settings: Partial<SettingsType>) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdate,
}) => {
  const { isAutostartEnabled, isLoading, toggleAutostart } = useAutostart();

  const handleAutostartToggle = async () => {
    await toggleAutostart(!isAutostartEnabled);
    // Update settings to reflect the new state
    onUpdate({ autoStart: !isAutostartEnabled });
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="settings-overlay"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="settings-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{
              opacity: 0,
              x: "-50%",
              y: "calc(-50% - 20px)",
              scale: 0.95,
            }}
            animate={{ opacity: 1, x: "-50%", y: "-50%", scale: 1 }}
            exit={{ opacity: 0, x: "-50%", y: "-50%", scale: 0.95 }}
            transition={{
              duration: 0.3,
              delay: 0.05,
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
          >
            <div className="settings-header">
              <h2 className="settings-title">SETTINGS</h2>
              <motion.button
                onClick={onClose}
                className="settings-close-button"
                aria-label="Close"
                whileHover={{ opacity: 1, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={24} strokeWidth={1.5} />
              </motion.button>
            </div>

            <div className="settings-content">
              <div className="settings-item">
                <label htmlFor="notify-interval" className="settings-label">
                  NOTIFICATION INTERVAL
                </label>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    id="notify-interval"
                    type="number"
                    min="1"
                    max="24"
                    value={settings.notifyInterval}
                    onChange={(e) =>
                      onUpdate({
                        notifyInterval: parseInt(e.target.value) || 3,
                      })
                    }
                    className="settings-input"
                    style={{ width: "80px" }}
                  />
                  <span style={{ opacity: 0.5 }}>hours</span>
                </div>
              </div>

              <div className="settings-divider" />

              <div className="settings-item">
                <div className="settings-toggle-wrapper">
                  <div className="settings-toggle-info">
                    <div className="settings-toggle-label">AUTO CARRY-OVER</div>
                    <div className="settings-toggle-description">
                      Move incomplete tasks to next day automatically
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      onUpdate({ autoCarryOver: !settings.autoCarryOver })
                    }
                    className={`toggle-switch ${
                      settings.autoCarryOver ? "active" : ""
                    }`}
                    aria-label="Toggle auto carry over"
                  >
                    <div className="toggle-thumb" />
                  </button>
                </div>
              </div>

              <div className="settings-divider" />

              <div className="settings-item">
                <div className="settings-toggle-wrapper">
                  <div className="settings-toggle-info">
                    <div className="settings-toggle-label">AUTO START</div>
                    <div className="settings-toggle-description">
                      Start app automatically when system boots
                    </div>
                  </div>
                  <button
                    onClick={handleAutostartToggle}
                    className={`toggle-switch ${
                      isAutostartEnabled ? "active" : ""
                    } ${isLoading ? "loading" : ""}`}
                    aria-label="Toggle autostart"
                    disabled={isLoading}
                  >
                    <div className="toggle-thumb" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
