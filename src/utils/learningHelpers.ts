import { LearningTopic, ReferenceLink } from "../types";

/**
 * Generate unique ID for learning entities
 * Uses timestamp + random for uniqueness
 */
export function generateLearningId(): number {
  return Date.now() + Math.random();
}

/**
 * Create a new learning topic with defaults
 */
export function createLearningTopic(title: string): LearningTopic {
  const now = new Date().toISOString();
  return {
    id: generateLearningId(),
    title,
    notes: "",
    referenceLinks: [],
    subtopics: [],
    expanded: false,
    blogPost: {
      written: false,
    },
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create a new reference link
 */
export function createReferenceLink(
  url: string
): ReferenceLink {
  return {
    id: generateLearningId(),
    url,
  };
}

/**
 * Count topics recursively
 * @param topics - Array of topics
 * @returns Object with total and completed counts
 */
export function countTopics(
  topics: LearningTopic[]
): { total: number } {
  let total = 0;

  const countRecursive = (topicList: LearningTopic[]) => {
    topicList.forEach((topic) => {
      total++;
      if (topic.subtopics.length > 0) {
        countRecursive(topic.subtopics);
      }
    });
  };

  countRecursive(topics);
  return { total };
}

/**
 * Count only root-level topics
 */
export function countRootTopics(
  topics: LearningTopic[]
): { total: number } {
  const total = topics.length;
  return { total };
}

/**
 * Count blog posts recursively
 */
export function countBlogPosts(
  topics: LearningTopic[]
): { total: number; written: number } {
  let total = 0;
  let written = 0;

  const countRecursive = (topicList: LearningTopic[]) => {
    topicList.forEach((topic) => {
      total++;
      if (topic.blogPost.written) written++;
      if (topic.subtopics.length > 0) {
        countRecursive(topic.subtopics);
      }
    });
  };

  countRecursive(topics);
  return { total, written };
}

/**
 * Count reference links recursively
 */
export function countReferenceLinks(topics: LearningTopic[]): number {
  let count = 0;

  const countRecursive = (topicList: LearningTopic[]) => {
    topicList.forEach((topic) => {
      count += topic.referenceLinks.length;
      if (topic.subtopics.length > 0) {
        countRecursive(topic.subtopics);
      }
    });
  };

  countRecursive(topics);
  return count;
}

/**
 * Update topic in tree (recursive search and update)
 */
export function updateTopicInTree(
  topics: LearningTopic[],
  topicId: number,
  updates: Partial<LearningTopic>
): LearningTopic[] {
  const updateRecursive = (topicList: LearningTopic[]): LearningTopic[] => {
    return topicList.map((topic) => {
      if (topic.id === topicId) {
        return {
          ...topic,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }

      if (topic.subtopics.length > 0) {
        return {
          ...topic,
          subtopics: updateRecursive(topic.subtopics),
        };
      }

      return topic;
    });
  };

  return updateRecursive(topics);
}

/**
 * Delete topic from tree (recursive search and delete)
 */
export function deleteTopicFromTree(
  topics: LearningTopic[],
  topicId: number
): LearningTopic[] {
  const deleteRecursive = (topicList: LearningTopic[]): LearningTopic[] => {
    return topicList
      .filter((topic) => topic.id !== topicId)
      .map((topic) => {
        if (topic.subtopics.length > 0) {
          return {
            ...topic,
            subtopics: deleteRecursive(topic.subtopics),
          };
        }
        return topic;
      });
  };

  return deleteRecursive(topics);
}

/**
 * Add subtopic to parent topic
 */
export function addSubtopicToTopic(
  topics: LearningTopic[],
  parentId: number,
  subtopic: LearningTopic
): LearningTopic[] {
  const addRecursive = (topicList: LearningTopic[]): LearningTopic[] => {
    return topicList.map((topic) => {
      if (topic.id === parentId) {
        return {
          ...topic,
          subtopics: [...topic.subtopics, subtopic],
          expanded: true, // Auto-expand parent when adding subtopic
          updatedAt: new Date().toISOString(),
        };
      }

      if (topic.subtopics.length > 0) {
        return {
          ...topic,
          subtopics: addRecursive(topic.subtopics),
        };
      }

      return topic;
    });
  };

  return addRecursive(topics);
}

/**
 * Toggle topic expansion state
 */
export function toggleTopicExpansion(
  topics: LearningTopic[],
  topicId: number
): LearningTopic[] {
  const toggleRecursive = (topicList: LearningTopic[]): LearningTopic[] => {
    return topicList.map((topic) => {
      if (topic.id === topicId) {
        return {
          ...topic,
          expanded: !topic.expanded,
        };
      }

      if (topic.subtopics.length > 0) {
        return {
          ...topic,
          subtopics: toggleRecursive(topic.subtopics),
        };
      }

      return topic;
    });
  };

  return toggleRecursive(topics);
}

/**
 * Expand all topics recursively
 */
export function expandAllTopics(topics: LearningTopic[]): LearningTopic[] {
  return topics.map((topic) => ({
    ...topic,
    expanded: true,
    subtopics: expandAllTopics(topic.subtopics),
  }));
}

/**
 * Collapse all topics recursively
 */
export function collapseAllTopics(topics: LearningTopic[]): LearningTopic[] {
  return topics.map((topic) => ({
    ...topic,
    expanded: false,
    subtopics: collapseAllTopics(topic.subtopics),
  }));
}

/**
 * Check if all topics are expanded
 */
export function areAllTopicsExpanded(topics: LearningTopic[]): boolean {
  const checkRecursive = (topicList: LearningTopic[]): boolean => {
    return topicList.every((topic) => {
      if (topic.subtopics.length > 0) {
        return topic.expanded && checkRecursive(topic.subtopics);
      }
      return topic.expanded;
    });
  };

  return checkRecursive(topics);
}


/**
 * Add reference link to topic
 */
export function addReferenceLinkToTopic(
  topics: LearningTopic[],
  topicId: number,
  link: ReferenceLink
): LearningTopic[] {
  return updateTopicInTree(topics, topicId, {
    referenceLinks: [
      ...topics.find((t) => t.id === topicId)!.referenceLinks,
      link,
    ],
  });
}

/**
 * Update reference link in topic
 */
export function updateReferenceLinkInTopic(
  topics: LearningTopic[],
  topicId: number,
  linkId: number,
  updates: Partial<ReferenceLink>
): LearningTopic[] {
  const updateLinksRecursive = (
    topicList: LearningTopic[]
  ): LearningTopic[] => {
    return topicList.map((topic) => {
      if (topic.id === topicId) {
        return {
          ...topic,
          referenceLinks: topic.referenceLinks.map((link) =>
            link.id === linkId ? { ...link, ...updates } : link
          ),
          updatedAt: new Date().toISOString(),
        };
      }

      if (topic.subtopics.length > 0) {
        return {
          ...topic,
          subtopics: updateLinksRecursive(topic.subtopics),
        };
      }

      return topic;
    });
  };

  return updateLinksRecursive(topics);
}

/**
 * Delete reference link from topic
 */
export function deleteReferenceLinkFromTopic(
  topics: LearningTopic[],
  topicId: number,
  linkId: number
): LearningTopic[] {
  const deleteLinksRecursive = (
    topicList: LearningTopic[]
  ): LearningTopic[] => {
    return topicList.map((topic) => {
      if (topic.id === topicId) {
        return {
          ...topic,
          referenceLinks: topic.referenceLinks.filter(
            (link) => link.id !== linkId
          ),
          updatedAt: new Date().toISOString(),
        };
      }

      if (topic.subtopics.length > 0) {
        return {
          ...topic,
          subtopics: deleteLinksRecursive(topic.subtopics),
        };
      }

      return topic;
    });
  };

  return deleteLinksRecursive(topics);
}
