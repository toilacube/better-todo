import { X } from 'lucide-react';
import { Settings as SettingsType } from '../types';

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
  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2 className="settings-title">Cài đặt</h2>
          <button onClick={onClose} className="settings-close-button" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-item">
            <label htmlFor="notify-interval" className="settings-label">
              Nhắc nhở Must-Do (giờ)
            </label>
            <input
              id="notify-interval"
              type="number"
              min="1"
              max="24"
              value={settings.notifyInterval}
              onChange={(e) =>
                onUpdate({ notifyInterval: parseInt(e.target.value) || 3 })
              }
              className="settings-input"
            />
          </div>

          <div className="settings-divider" />

          <div className="settings-item">
            <div className="settings-toggle-wrapper">
              <div>
                <div className="settings-toggle-label">Tự động chuyển task</div>
                <div className="settings-toggle-description">
                  Task chưa xong tự động sang ngày mới
                </div>
              </div>
              <button
                onClick={() => onUpdate({ autoCarryOver: !settings.autoCarryOver })}
                className={`toggle-switch ${settings.autoCarryOver ? 'active' : ''}`}
                aria-label="Toggle auto carry over"
              >
                <div className="toggle-thumb" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
