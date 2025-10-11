import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskInputProps {
  onAdd: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const TaskInput: React.FC<TaskInputProps> = ({
  onAdd,
  placeholder = 'add new task',
  autoFocus = false,
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text);
      setText('');
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="task-input"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="task-input-field"
      />
      <motion.button
        type="submit"
        className="task-input-button"
        aria-label="Add task"
        whileHover={{ opacity: 1, rotate: 90 }}
        whileTap={{ rotate: 90, scale: 0.9 }}
      >
        <Plus size={24} strokeWidth={1.5} />
      </motion.button>
    </motion.form>
  );
};
