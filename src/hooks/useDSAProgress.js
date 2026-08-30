import { useState, useEffect } from "react";
import dsaProblems, { dsaTopics } from "../data/dsa";

const STORAGE_KEY = "careerforge_dsa_progress_v1";

export function useDSAProgress() {
  const [progressState, setProgressState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load DSA progress from localStorage", e);
    }
    // Default initial seeded progress
    return {
      problems: {
        "arrays-two-pointers": {
          "two-sum": { status: "solved", bookmarked: true, notes: "O(n) time with hash table complement lookup" },
          "three-sum": { status: "reviewing", bookmarked: false, notes: "Remember to skip duplicates in inner while loop" },
        },
        "stack-queue": {
          "valid-parentheses": { status: "solved", bookmarked: false, notes: "Simple LIFO stack" },
        },
        "sliding-window": {
          "longest-substring-without-repeating": { status: "solved", bookmarked: true, notes: "Map index of last occurrence" },
        },
        "trees-graphs": {
          "invert-binary-tree": { status: "solved", bookmarked: false, notes: "Swap left and right subtrees recursively" },
        },
      },
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressState));
    } catch (e) {
      console.error("Failed to save DSA progress", e);
    }
  }, [progressState]);

  const getProblemProgress = (topicSlug, problemId) => {
    return (
      progressState.problems?.[topicSlug]?.[problemId] || {
        status: "unsolved",
        bookmarked: false,
        notes: "",
      }
    );
  };

  const setProblemStatus = (topicSlug, problemId, status) => {
    setProgressState((prev) => {
      const topicProblems = prev.problems?.[topicSlug] || {};
      const current = topicProblems[problemId] || { bookmarked: false, notes: "" };
      return {
        ...prev,
        problems: {
          ...prev.problems,
          [topicSlug]: {
            ...topicProblems,
            [problemId]: {
              ...current,
              status,
            },
          },
        },
      };
    });
  };

  const toggleBookmark = (topicSlug, problemId) => {
    setProgressState((prev) => {
      const topicProblems = prev.problems?.[topicSlug] || {};
      const current = topicProblems[problemId] || { status: "unsolved", notes: "" };
      return {
        ...prev,
        problems: {
          ...prev.problems,
          [topicSlug]: {
            ...topicProblems,
            [problemId]: {
              ...current,
              bookmarked: !current.bookmarked,
            },
          },
        },
      };
    });
  };

  const setProblemNote = (topicSlug, problemId, notes) => {
    setProgressState((prev) => {
      const topicProblems = prev.problems?.[topicSlug] || {};
      const current = topicProblems[problemId] || { status: "unsolved", bookmarked: false };
      return {
        ...prev,
        problems: {
          ...prev.problems,
          [topicSlug]: {
            ...topicProblems,
            [problemId]: {
              ...current,
              notes,
            },
          },
        },
      };
    });
  };

  const resetProgress = () => {
    const emptyState = { problems: {} };
    setProgressState(emptyState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyState));
  };

  // Calculate detailed stats and topic progresses
  let totalProblems = 0;
  let totalSolved = 0;
  let masteredCount = 0;
  let totalMinutes = 0;
  let solvedMinutes = 0;

  const topics = dsaTopics.map((topic) => {
    const topicProblemList = dsaProblems[topic.slug] || [];
    const count = topicProblemList.length;
    let solvedInTopic = 0;

    topicProblemList.forEach((prob) => {
      totalProblems += 1;
      totalMinutes += prob.estimatedTime || 30;

      const pState = progressState.problems?.[topic.slug]?.[prob.id];
      if (pState?.status === "solved") {
        solvedInTopic += 1;
        totalSolved += 1;
        masteredCount += 1;
        solvedMinutes += prob.estimatedTime || 30;
      }
    });

    const progress = count > 0 ? Math.round((solvedInTopic / count) * 100) : 0;
    return {
      ...topic,
      problemCount: count,
      solved: solvedInTopic,
      progress,
    };
  });

  const progressPercent =
    totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  const stats = {
    totalProblems,
    totalSolved,
    progressPercent,
    masteredCount,
    solvedHours: Math.round(solvedMinutes / 60) || 12,
    totalHours: Math.round(totalMinutes / 60) || 45,
  };

  return {
    progressState,
    getProblemProgress,
    setProblemStatus,
    toggleBookmark,
    setProblemNote,
    resetProgress,
    topics,
    stats,
  };
}
