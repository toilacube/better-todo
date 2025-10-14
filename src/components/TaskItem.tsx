import { useState } from "react";
import { ChevronRight, Plus, Trash2, Check, X, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "../types";
import { countCompletedSubtasks } from "../utils/taskHelpers";

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: number) => void;
  onDelete: (taskId: number) => void;
  onAddSubtask: (parentId: number, text: string) => void;
  onToggleExpand: (taskId: number) => void;
  onUpdateText: (taskId: number, newText: string) => void;
  level?: number;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onAddSubtask,
  onToggleExpand,
  onUpdateText,
  level = 0,
}) => {
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [subtaskText, setSubtaskText] = useState("");
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedText, setEditedText] = useState(task.text);

  const hasSubtasks = task.subtasks.length > 0;
  const { completed: completedCount, total: totalCount } =
    countCompletedSubtasks(task);

  const handleAddSubtask = () => {
    if (subtaskText.trim()) {
      onAddSubtask(task.id, subtaskText);
      setSubtaskText("");
      setIsAddingSubtask(false);
    }
  };

  const handleCancelAddSubtask = () => {
    setSubtaskText("");
    setIsAddingSubtask(false);
  };

  const handleSaveText = () => {
    if (editedText.trim() && editedText !== task.text) {
      onUpdateText(task.id, editedText.trim());
    }
    setIsEditingText(false);
  };

  const handleCancelEditText = () => {
    setEditedText(task.text);
    setIsEditingText(false);
  };

  return (
    <motion.div
      className="task-item"
      style={{ marginLeft: level > 0 ? "32px" : "0" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="task-item-content">
        <div className="task-item-left">
          <motion.button
            onClick={() => hasSubtasks && onToggleExpand(task.id)}
            className={`task-expand-button ${task.expanded ? "expanded" : ""}`}
            aria-label={task.expanded ? "Collapse" : "Expand"}
            whileHover={hasSubtasks ? { opacity: 1 } : {}}
            whileTap={hasSubtasks ? { scale: 0.9 } : {}}
            style={{
              cursor: hasSubtasks ? "pointer" : "default",
              visibility: hasSubtasks ? "visible" : "hidden",
            }}
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </motion.button>

          <motion.button
            onClick={() => onToggle(task.id)}
            className={`task-checkbox ${task.completed ? "completed" : ""}`}
            aria-label="Toggle completion"
            whileTap={{ scale: 0.95 }}
          >
            <div className="checkbox-circle" />
          </motion.button>

          {isEditingText ? (
            <input
              type="text"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveText();
                } else if (e.key === "Escape") {
                  handleCancelEditText();
                }
              }}
              onBlur={handleSaveText}
              autoFocus
              className="task-text-input"
            />
          ) : (
            <span className={`task-text ${task.completed ? "completed" : ""}`}>
              {task.text}
            </span>
          )}

          {hasSubtasks && (
            <span className="task-counter">
              ({completedCount}/{totalCount})
            </span>
          )}
        </div>

        <div className="task-item-actions">
          <motion.button
            onClick={() => setIsEditingText(true)}
            className="task-action-button"
            aria-label="Edit task"
            title="Edit task"
            whileHover={{ opacity: 1, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Pencil size={18} strokeWidth={1.5} />
          </motion.button>

          {!isAddingSubtask ? (
            <motion.button
              onClick={() => setIsAddingSubtask(true)}
              className="task-action-button"
              aria-label="Add subtask"
              whileHover={{ opacity: 1, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={20} strokeWidth={1.5} />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleCancelAddSubtask}
              className="task-action-button"
              aria-label="Cancel"
              whileHover={{ opacity: 1, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={20} strokeWidth={1.5} />
            </motion.button>
          )}

          <motion.button
            onClick={() => onDelete(task.id)}
            className="task-action-button"
            aria-label="Delete task"
            whileHover={{ opacity: 1, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 size={20} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isAddingSubtask && (
          <motion.div
            className="subtask-input-wrapper"
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 48, opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <input
              type="text"
              value={subtaskText}
              onChange={(e) => setSubtaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddSubtask();
                } else if (e.key === "Escape") {
                  handleCancelAddSubtask();
                }
              }}
              placeholder="enter subtask"
              autoFocus
              className="subtask-input"
            />
            <motion.button
              onClick={handleAddSubtask}
              className="subtask-confirm-button"
              aria-label="Confirm"
              whileHover={{ opacity: 1, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Check size={20} strokeWidth={1.5} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasSubtasks && task.expanded && (
          <motion.div
            className="subtasks-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            {task.subtasks.map((subtask, index) => (
              <motion.div
                key={subtask.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TaskItem
                  task={subtask}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onAddSubtask={onAddSubtask}
                  onToggleExpand={onToggleExpand}
                  onUpdateText={onUpdateText}
                  level={level + 1}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
