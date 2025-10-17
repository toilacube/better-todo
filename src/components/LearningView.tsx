import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ChevronRight, BookOpen } from "lucide-react";
import { LearningViewType, WeeklyLearningEntry } from "../types";
import { useLearningTopics } from "../hooks/useLearningTopics";
import { useLearningHistory } from "../hooks/useLearningHistory";
import { useLearningSettings } from "../hooks/useLearningSettings";
import { storage } from "../store/storage";
import { TopicInput } from "./TopicInput";
import { TopicItem } from "./TopicItem";
import { getCurrentWeekId, isNewWeek, getWeekDisplayString } from "../utils/weekHelpers";
import "../styles/LearningView.css";

interface LearningViewProps {
  // Root component for learning section
}

export function LearningView(_props: LearningViewProps) {
  const [view, setView] = useState<LearningViewType>("topics");
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  const learningTopics = useLearningTopics();
  const { addWeekEntry, getAllWeekEntries } = useLearningHistory();
  const { learningSettings } = useLearningSettings();
  const currentWeekId = getCurrentWeekId();

  const toggleWeekExpansion = (weekId: string) => {
    setExpandedWeeks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(weekId)) {
        newSet.delete(weekId);
      } else {
        newSet.add(weekId);
      }
      return newSet;
    });
  };

  // Check for week transitions (similar to day transition in App.tsx)
  useEffect(() => {
    const checkWeekTransition = async () => {
      const lastWeekId = await storage.getLastWeekId();

      if (isNewWeek(lastWeekId)) {
        // Archive last week's topics
        const lastWeekTopics = await storage.getCurrentWeekTopics();
        if (lastWeekTopics.length > 0 && learningSettings.autoCreateNewWeek) {
          await addWeekEntry(lastWeekId, lastWeekTopics);
        }

        // Update last week ID
        await storage.setLastWeekId(getCurrentWeekId());
      }
    };

    checkWeekTransition();

    // Check every hour
    const interval = setInterval(checkWeekTransition, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [learningSettings.autoCreateNewWeek]);

  // Topics View
  if (view === "topics") {
    return (
      <div className="learning-view">
        <div className="current-week-header">
          <h2 className="current-week-title">{getWeekDisplayString(currentWeekId)}</h2>
          <motion.button
            onClick={() => setView("history")}
            className="toolbar-button"
            aria-label="View history"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <History size={18} strokeWidth={1.5} />
            <span>History</span>
          </motion.button>
        </div>

        <div className="toolbar">
          <TopicInput onAdd={learningTopics.addTopic} autoFocus />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key="topics-list"
            className="tasks-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {learningTopics.topics.length === 0 ? (
              <motion.div
                className="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                NO LEARNING TOPICS YET
                <br />
                <span style={{ fontSize: "0.85em", opacity: 0.7 }}>
                  Press Enter to add your first topic
                </span>
              </motion.div>
            ) : (
              learningTopics.topics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <TopicItem
                    topic={topic}
                    onDelete={learningTopics.deleteTopic}
                    onAddSubtopic={learningTopics.addSubtopic}
                    onToggleExpand={learningTopics.toggleExpansion}
                    onUpdateNotes={learningTopics.updateNotes}
                    onAddReferenceLink={learningTopics.addReferenceLink}
                    onDeleteReferenceLink={learningTopics.deleteReferenceLink}
                    onToggleBlogPost={learningTopics.toggleBlogPost}
                    onUpdateBlogPostURL={learningTopics.updateBlogPostURL}
                    onUpdateTitle={learningTopics.updateTopicTitle}
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // History View
  if (view === "history") {
    const historyEntries = getAllWeekEntries();

    return (
      <div className="learning-view">
        <div className="history-header">
          <motion.button
            onClick={() => setView("topics")}
            className="toolbar-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight size={18} strokeWidth={1.5} style={{ transform: 'rotate(180deg)' }} />
            <span>Back to Topics</span>
          </motion.button>
          <h2 className="history-title">Learning History</h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            className="history-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {historyEntries.length === 0 ? (
              <motion.div
                className="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                NO LEARNING HISTORY YET
                <br />
                <span style={{ fontSize: "0.85em", opacity: 0.7 }}>
                  Complete your first week to see history
                </span>
              </motion.div>
            ) : (
              historyEntries.map((entry, index) => (
                <WeekHistoryEntry
                  key={entry.weekId}
                  entry={entry}
                  isExpanded={expandedWeeks.has(entry.weekId)}
                  onToggleExpand={() => toggleWeekExpansion(entry.weekId)}
                  index={index}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Statistics view (placeholder for now)
  return (
    <div className="learning-view">
      <div className="coming-soon">
        <h3>Learning Statistics</h3>
        <p>
          Visualize your learning journey with charts and metrics. Track completion rates, blog posts, weekly streaks, and more.
        </p>
        <button onClick={() => setView("topics")} className="save-button">
          Back to Topics
        </button>
      </div>
    </div>
  );
}

// Week History Entry Component
interface WeekHistoryEntryProps {
  entry: WeeklyLearningEntry;
  isExpanded: boolean;
  onToggleExpand: () => void;
  index: number;
}

function WeekHistoryEntry({ entry, isExpanded, onToggleExpand, index }: WeekHistoryEntryProps) {
  const blogPostCount = entry.topics.reduce((count, topic) => {
    return count + (topic.blogPost.written ? 1 : 0);
  }, 0);

  return (
    <motion.div
      className="week-history-entry"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <motion.div
        className="week-history-header"
        onClick={onToggleExpand}
        whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.05)" }}
      >
        <div className="week-history-header-left">
          <motion.div
            className="week-expand-icon"
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </motion.div>
          <div className="week-history-info">
            <h3 className="week-history-title">{getWeekDisplayString(entry.weekId)}</h3>
            <div className="week-history-stats">
              {blogPostCount > 0 && (
                <span className="week-stat blog-stat">
                  <BookOpen size={14} />
                  {blogPostCount} blog post{blogPostCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="week-history-topics"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {entry.topics.length === 0 ? (
              <p className="empty-message">No topics for this week</p>
            ) : (
              entry.topics.map((topic) => (
                <HistoryTopicItem key={topic.id} topic={topic} level={0} />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// History Topic Item Component (Read-only)
interface HistoryTopicItemProps {
  topic: any;
  level: number;
}

function HistoryTopicItem({ topic, level }: HistoryTopicItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;

  return (
    <div className="history-topic-item" style={{ marginLeft: level > 0 ? '24px' : '0' }}>
      <div className="history-topic-content">
        {hasSubtopics && (
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="history-topic-expand"
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </motion.button>
        )}
        {!hasSubtopics && <div style={{ width: '16px' }} />}

        <div className={`history-topic-checkbox ${topic.completed ? 'completed' : ''}`}>
          <div className="checkbox-circle" />
        </div>

        <span className={`history-topic-text ${topic.completed ? 'completed' : ''}`}>
          {topic.title}
        </span>

        {topic.blogPost && topic.blogPost.written && (
          <span className="blog-badge" title="Blog post written">
            <BookOpen size={14} />
          </span>
        )}
      </div>

      {hasSubtopics && isExpanded && (
        <div className="history-subtopics">
          {topic.subtopics.map((subtopic: any) => (
            <HistoryTopicItem key={subtopic.id} topic={subtopic} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
