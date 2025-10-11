import { useState } from 'react';
import { Plus } from 'lucide-react';

interface TaskInputProps {
  onAdd: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const TaskInput: React.FC<TaskInputProps> = ({
  onAdd,
  placeholder = 'Thêm task...',
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
    <form onSubmit={handleSubmit} className="task-input">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="task-input-field"
      />
      <button type="submit" className="task-input-button" aria-label="Add task">
        <Plus size={20} />
      </button>
    </form>
  );
};
