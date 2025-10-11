import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Trash2, Check, X } from 'lucide-react';
import { Task } from '../types';
import { countCompletedSubtasks } from '../utils/taskHelpers';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: number) => void;
  onDelete: (taskId: number) => void;
  onAddSubtask: (parentId: number, text: string) => void;
  onToggleExpand: (taskId: number) => void;
  level?: number;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onAddSubtask,
  onToggleExpand,
  level = 0,
}) => {
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [subtaskText, setSubtaskText] = useState('');

  const hasSubtasks = task.subtasks.length > 0;
  const { completed: completedCount, total: totalCount } = countCompletedSubtasks(task);

  const handleAddSubtask = () => {
    if (subtaskText.trim()) {
      onAddSubtask(task.id, subtaskText);
      setSubtaskText('');
      setIsAddingSubtask(false);
    }
  };

  const handleCancelAddSubtask = () => {
    setSubtaskText('');
    setIsAddingSubtask(false);
  };

  return (
    <div className="task-item" style={{ marginLeft: level > 0 ? '24px' : '0' }}>
      <div className="task-item-content">
        <div className="task-item-left">
          {hasSubtasks && (
            <button
              onClick={() => onToggleExpand(task.id)}
              className="task-expand-button"
              aria-label={task.expanded ? 'Collapse' : 'Expand'}
            >
              {task.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}

          <button
            onClick={() => onToggle(task.id)}
            className={`task-checkbox ${task.completed ? 'completed' : ''}`}
            aria-label="Toggle completion"
          >
            <div className="checkbox-circle" />
          </button>

          <span className={`task-text ${task.completed ? 'completed' : ''}`}>
            {task.text}
          </span>

          {hasSubtasks && (
            <span className="task-counter">
              ({completedCount}/{totalCount})
            </span>
          )}
        </div>

        <div className="task-item-actions">
          {!isAddingSubtask ? (
            <button
              onClick={() => setIsAddingSubtask(true)}
              className="task-action-button"
              aria-label="Add subtask"
            >
              <Plus size={16} />
            </button>
          ) : (
            <button
              onClick={handleCancelAddSubtask}
              className="task-action-button"
              aria-label="Cancel"
            >
              <X size={16} />
            </button>
          )}

          <button
            onClick={() => onDelete(task.id)}
            className="task-action-button"
            aria-label="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isAddingSubtask && (
        <div className="subtask-input-wrapper">
          <input
            type="text"
            value={subtaskText}
            onChange={(e) => setSubtaskText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddSubtask();
              } else if (e.key === 'Escape') {
                handleCancelAddSubtask();
              }
            }}
            placeholder="Tên subtask..."
            autoFocus
            className="subtask-input"
          />
          <button
            onClick={handleAddSubtask}
            className="subtask-confirm-button"
            aria-label="Confirm"
          >
            <Check size={16} />
          </button>
        </div>
      )}

      {hasSubtasks && task.expanded && (
        <div className="subtasks-container">
          {task.subtasks.map((subtask) => (
            <TaskItem
              key={subtask.id}
              task={subtask}
              onToggle={onToggle}
              onDelete={onDelete}
              onAddSubtask={onAddSubtask}
              onToggleExpand={onToggleExpand}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
