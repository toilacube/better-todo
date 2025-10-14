import { useState, useEffect, useRef } from "react";
import { LearningTopic } from "../types";
import { storage } from "../store/storage";
import {
  createLearningTopic,
  createReferenceLink,
  toggleTopicCompletion,
  updateTopicInTree,
  deleteTopicFromTree,
  addSubtopicToTopic,
  toggleTopicExpansion,
  expandAllTopics,
  collapseAllTopics,
  areAllTopicsExpanded,
  addReferenceLinkToTopic,
  updateReferenceLinkInTopic,
  deleteReferenceLinkFromTopic,
} from "../utils/learningHelpers";
import { getCurrentWeekId } from "../utils/weekHelpers";

export const useLearningTopics = (reloadTrigger?: number) => {
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [currentWeekId] = useState<string>(getCurrentWeekId());
  const isLoadingRef = useRef(false);

  // Load topics from storage on mount and when reloadTrigger changes
  useEffect(() => {
    const loadTopics = async () => {
      isLoadingRef.current = true;
      const loadedTopics = await storage.getCurrentWeekTopics();
      setTopics(loadedTopics);
      // Reset flag after a small delay to allow state to settle
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 0);
    };
    loadTopics();
  }, [reloadTrigger]);

  // Save topics to storage whenever they change (but not during load)
  useEffect(() => {
    // Skip saving if we're currently loading
    if (isLoadingRef.current) {
      return;
    }

    const saveTopics = async () => {
      await storage.setCurrentWeekTopics(topics);
    };
    saveTopics();
  }, [topics]);

  // Topic CRUD operations
  const addTopic = (title: string) => {
    if (!title.trim()) return;
    setTopics([...topics, createLearningTopic(title)]);
  };

  const updateTopic = (topicId: number, updates: Partial<LearningTopic>) => {
    setTopics(updateTopicInTree(topics, topicId, updates));
  };

  const updateTopicTitle = (topicId: number, title: string) => {
    if (!title.trim()) return;
    setTopics(updateTopicInTree(topics, topicId, { title }));
  };

  const deleteTopic = (topicId: number) => {
    setTopics(deleteTopicFromTree(topics, topicId));
  };

  const toggleTopicCompletionHandler = (topicId: number) => {
    setTopics(toggleTopicCompletion(topics, topicId));
  };

  // Subtopic operations
  const addSubtopic = (parentId: number, title: string) => {
    if (!title.trim()) return;
    const subtopic = createLearningTopic(title);
    setTopics(addSubtopicToTopic(topics, parentId, subtopic));
  };

  // Notes operations
  const updateNotes = (topicId: number, notes: string) => {
    setTopics(updateTopicInTree(topics, topicId, { notes }));
  };

  // Reference link operations
  const addReferenceLink = (topicId: number, title: string, url: string) => {
    if (!title.trim() || !url.trim()) return;
    const link = createReferenceLink(title, url);
    setTopics(addReferenceLinkToTopic(topics, topicId, link));
  };

  const updateReferenceLink = (
    topicId: number,
    linkId: number,
    title: string,
    url: string
  ) => {
    setTopics(updateReferenceLinkInTopic(topics, topicId, linkId, { title, url }));
  };

  const deleteReferenceLink = (topicId: number, linkId: number) => {
    setTopics(deleteReferenceLinkFromTopic(topics, topicId, linkId));
  };

  // Blog post operations
  const toggleBlogPost = (topicId: number) => {
    // Find the topic and toggle its blog post status
    const findAndToggle = (topicList: LearningTopic[]): LearningTopic[] => {
      return topicList.map((topic) => {
        if (topic.id === topicId) {
          return {
            ...topic,
            blogPost: {
              ...topic.blogPost,
              written: !topic.blogPost.written,
            },
            updatedAt: new Date().toISOString(),
          };
        }
        if (topic.subtopics.length > 0) {
          return {
            ...topic,
            subtopics: findAndToggle(topic.subtopics),
          };
        }
        return topic;
      });
    };
    setTopics(findAndToggle(topics));
  };

  const updateBlogPostURL = (topicId: number, url: string) => {
    setTopics(
      updateTopicInTree(topics, topicId, {
        blogPost: { written: true, url },
      })
    );
  };

  // Expansion operations
  const toggleExpansion = (topicId: number) => {
    setTopics(toggleTopicExpansion(topics, topicId));
  };

  const expandAll = () => {
    setTopics(expandAllTopics(topics));
  };

  const collapseAll = () => {
    setTopics(collapseAllTopics(topics));
  };

  const toggleExpandCollapse = () => {
    if (areAllTopicsExpanded(topics)) {
      setTopics(collapseAllTopics(topics));
    } else {
      setTopics(expandAllTopics(topics));
    }
  };

  const allExpanded = areAllTopicsExpanded(topics);

  // Bulk update
  const updateTopics = (newTopics: LearningTopic[]) => {
    setTopics(newTopics);
  };

  return {
    topics,
    currentWeekId,
    isCurrentWeek: true, // Always true for this hook (current week only)

    // Topic CRUD
    addTopic,
    updateTopic,
    updateTopicTitle,
    deleteTopic,
    toggleTopicCompletion: toggleTopicCompletionHandler,

    // Subtopic operations
    addSubtopic,

    // Notes operations
    updateNotes,

    // Reference link operations
    addReferenceLink,
    updateReferenceLink,
    deleteReferenceLink,

    // Blog post operations
    toggleBlogPost,
    updateBlogPostURL,

    // Expansion operations
    toggleExpansion,
    expandAll,
    collapseAll,
    toggleExpandCollapse,
    allExpanded,

    // Bulk operations
    updateTopics,
  };
};
