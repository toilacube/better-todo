import { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import "../styles/TopicInput.css";

interface TopicInputProps {
  onAdd: (title: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const TopicInput: React.FC<TopicInputProps> = ({
  onAdd,
  placeholder = "add new learning topic",
  autoFocus = false,
}) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text);
      setText("");
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="topic-input"
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
        className="topic-input-field"
      />
      <motion.button
        type="submit"
        className="topic-input-button"
        aria-label="Add learning topic"
        whileHover={{ scale: 1.15, rotate: 90 }}
        whileTap={{ rotate: 90, scale: 0.95 }}
      >
        <Plus size={24} strokeWidth={1.5} />
      </motion.button>
    </motion.form>
  );
};
