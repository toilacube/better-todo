import { useState } from "react";
import {
  ChevronRight,
  Plus,
  Trash2,
  Check,
  X,
  Link as LinkIcon,
  BookOpen,
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LearningTopic } from "../types";
import "../styles/TopicItem.css";

interface TopicItemProps {
  topic: LearningTopic;
  onDelete: (topicId: number) => void;
  onAddSubtopic: (parentId: number, title: string) => void;
  onToggleExpand: (topicId: number) => void;
  onUpdateNotes: (topicId: number, notes: string) => void;
  onAddReferenceLink: (topicId: number, url: string) => void;
  onDeleteReferenceLink: (topicId: number, linkId: number) => void;
  onToggleBlogPost: (topicId: number) => void;
  onUpdateBlogPostURL: (topicId: number, url: string) => void;
  onUpdateTitle: (topicId: number, title: string) => void;
  level?: number;
}

export const TopicItem: React.FC<TopicItemProps> = ({
  topic,
  onDelete,
  onAddSubtopic,
  onToggleExpand,
  onUpdateNotes,
  onAddReferenceLink,
  onDeleteReferenceLink,
  onToggleBlogPost,
  onUpdateBlogPostURL,
  onUpdateTitle,
  level = 0,
}) => {
  const [isAddingSubtopic, setIsAddingSubtopic] = useState(false);
  const [subtopicText, setSubtopicText] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [notesText, setNotesText] = useState(topic.notes);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [blogUrl, setBlogUrl] = useState(topic.blogPost.url || "");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(topic.title);

  const hasSubtopics = topic.subtopics.length > 0;
  const handleAddSubtopic = () => {
    if (subtopicText.trim()) {
      onAddSubtopic(topic.id, subtopicText);
      setSubtopicText("");
      setIsAddingSubtopic(false);
    }
  };

  const handleCancelAddSubtopic = () => {
    setSubtopicText("");
    setIsAddingSubtopic(false);
  };

  const handleSaveNotes = () => {
    onUpdateNotes(topic.id, notesText);
    setIsEditingNotes(false);
  };

  const handleAddLink = () => {
    if (newLinkUrl.trim()) {
      onAddReferenceLink(topic.id, newLinkUrl);
      setNewLinkUrl("");
      setIsAddingLink(false);
    }
  };

  const handleBlogUrlChange = () => {
    if (blogUrl.trim()) {
      onUpdateBlogPostURL(topic.id, blogUrl);
    }
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== topic.title) {
      onUpdateTitle(topic.id, editedTitle);
    }
    setIsEditingTitle(false);
  };

  const handleCancelEditTitle = () => {
    setEditedTitle(topic.title);
    setIsEditingTitle(false);
  };

  return (
    <motion.div
      className="topic-item"
      style={{ marginLeft: level > 0 ? "32px" : "0" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="topic-item-content">
        <div className="topic-item-left">
          <motion.button
            onClick={() => hasSubtopics && onToggleExpand(topic.id)}
            className={`topic-expand-button ${topic.expanded ? "expanded" : ""}`}
            aria-label={topic.expanded ? "Collapse" : "Expand"}
            whileHover={hasSubtopics ? { scale: 1.1 } : {}}
            whileTap={hasSubtopics ? { scale: 0.9 } : {}}
            style={{
              cursor: hasSubtopics ? "pointer" : "default",
              visibility: hasSubtopics ? "visible" : "hidden",
            }}
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </motion.button>

          {isEditingTitle ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveTitle();
                } else if (e.key === "Escape") {
                  handleCancelEditTitle();
                }
              }}
              onBlur={handleSaveTitle}
              autoFocus
              className="topic-title-input"
            />
          ) : (
            <span
              className="topic-text"
              onClick={() => setShowDetails(!showDetails)}
              style={{ cursor: "pointer" }}
            >
              {topic.title}
            </span>
          )}

          {topic.blogPost.written && (
            <span className="blog-badge" title="Blog post written">
              <BookOpen size={14} />
            </span>
          )}
        </div>

        <div className="topic-item-actions">
          <motion.button
            onClick={() => setIsEditingTitle(true)}
            className="topic-action-button"
            aria-label="Edit topic"
            title="Edit topic"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <Pencil size={18} strokeWidth={1.5} />
          </motion.button>

          {!isAddingSubtopic ? (
            <motion.button
              onClick={() => setIsAddingSubtopic(true)}
              className="topic-action-button"
              aria-label="Add subtopic"
              title="Add subtopic"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus size={18} strokeWidth={1.5} />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleCancelAddSubtopic}
              className="topic-action-button"
              aria-label="Cancel"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={18} strokeWidth={1.5} />
            </motion.button>
          )}

          <motion.button
            onClick={() => onDelete(topic.id)}
            className="topic-action-button"
            aria-label="Delete topic"
            title="Delete topic"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 size={18} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>

      {/* Subtopic Input */}
      <AnimatePresence>
        {isAddingSubtopic && (
          <motion.div
            className="subtask-input-wrapper"
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 48, opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <input
              type="text"
              value={subtopicText}
              onChange={(e) => setSubtopicText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddSubtopic();
                } else if (e.key === "Escape") {
                  handleCancelAddSubtopic();
                }
              }}
              placeholder="enter subtopic"
              autoFocus
              className="subtask-input"
            />
            <motion.button
              onClick={handleAddSubtopic}
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

      {/* Details Section: Notes, Links, Blog */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            className="topic-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Notes Section */}
            <div className="topic-section">
              <div className="topic-section-header">
                <h4>Notes</h4>
                <button
                  onClick={() => setIsEditingNotes(!isEditingNotes)}
                  className="edit-toggle-button"
                >
                  {isEditingNotes ? "Preview" : "Edit"}
                </button>
              </div>
              {isEditingNotes ? (
                <div className="notes-editor">
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Enter your notes (markdown supported)..."
                    className="notes-textarea"
                    rows={6}
                  />
                  <button onClick={handleSaveNotes} className="save-button">
                    Save Notes
                  </button>
                </div>
              ) : (
                <div className="notes-preview">
                  {topic.notes ? (
                    <pre className="notes-content">{topic.notes}</pre>
                  ) : (
                    <p className="empty-message">No notes yet. Click Edit to add.</p>
                  )}
                </div>
              )}
            </div>

            {/* Reference Links Section */}
            <div className="topic-section">
              <div className="topic-section-header">
                <h4>Reference Links</h4>
                <button
                  onClick={() => setIsAddingLink(!isAddingLink)}
                  className="add-button"
                >
                  {isAddingLink ? "Cancel" : "Add Link"}
                </button>
              </div>

              {isAddingLink && (
                <div className="link-form">
                  <input
                    type="url"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="link-input"
                  />
                  <button onClick={handleAddLink} className="save-button">
                    Add Link
                  </button>
                </div>
              )}

              <div className="links-list">
                {topic.referenceLinks.length > 0 ? (
                  topic.referenceLinks.map((link) => (
                    <div key={link.id} className="link-item">
                      <div className="link-info">
                        <LinkIcon size={14} />
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-title"
                        >
                          {link.url}
                        </a>
                      </div>
                      <button
                        onClick={() => onDeleteReferenceLink(topic.id, link.id)}
                        className="delete-link-button"
                        aria-label="Delete link"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="empty-message">No reference links yet.</p>
                )}
              </div>
            </div>

            {/* Blog Post Section */}
            <div className="topic-section">
              <div className="topic-section-header">
                <h4>Blog Post</h4>
              </div>
              <div className="blog-tracker">
                <label className="blog-checkbox-label">
                  <input
                    type="checkbox"
                    checked={topic.blogPost.written}
                    onChange={() => onToggleBlogPost(topic.id)}
                  />
                  Written blog post about this topic?
                </label>
                {topic.blogPost.written && (
                  <div className="blog-url-input">
                    <input
                      type="url"
                      value={blogUrl}
                      onChange={(e) => setBlogUrl(e.target.value)}
                      onBlur={handleBlogUrlChange}
                      placeholder="https://... (optional)"
                      className="link-input"
                    />
                    {topic.blogPost.url && (
                      <a
                        href={topic.blogPost.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="blog-link"
                      >
                        View Post
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtopics */}
      <AnimatePresence>
        {hasSubtopics && topic.expanded && (
          <motion.div
            className="subtopics-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            {topic.subtopics.map((subtopic, index) => (
              <motion.div
                key={subtopic.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TopicItem
                  topic={subtopic}
                  onDelete={onDelete}
                  onAddSubtopic={onAddSubtopic}
                  onToggleExpand={onToggleExpand}
                  onUpdateNotes={onUpdateNotes}
                  onAddReferenceLink={onAddReferenceLink}
                  onDeleteReferenceLink={onDeleteReferenceLink}
                  onToggleBlogPost={onToggleBlogPost}
                  onUpdateBlogPostURL={onUpdateBlogPostURL}
                  onUpdateTitle={onUpdateTitle}
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
