import { useCallback, useEffect, useMemo, useState } from "react";

import dsaProblems, { dsaTopics } from "../data/dsa";
import {
  getDSAProgress,
  resetDSAProgress,
  updateDSAProgress,
} from "../services/api";

const STORAGE_KEY = "careerforge-dsa-progress-v1";
const completedStatuses = new Set(["Solved", "Revised", "Mastered"]);

function readStoredProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeStoredProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getProblemKey(topicSlug, problemSlug) {
  return `${topicSlug}:${problemSlug}`;
}

function countByDifficulty(problems) {
  return problems.reduce(
    (counts, problem) => ({
      ...counts,
      [problem.difficulty]: (counts[problem.difficulty] || 0) + 1,
    }),
    { Easy: 0, Medium: 0, Hard: 0 },
  );
}

function syncProblem(topicSlug, problemSlug, payload) {
  if (!localStorage.getItem("token")) {
    return;
  }

  updateDSAProgress(topicSlug, problemSlug, payload).catch(() => {
    // Local progress remains usable if the API is offline.
  });
}

export function useDSAProgress() {
  const [progress, setProgress] = useState(readStoredProgress);
  const [syncState, setSyncState] = useState("local");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      return;
    }

    let ignore = false;

    getDSAProgress()
      .then((data) => {
        if (ignore || !data.success) {
          return;
        }

        setProgress(data.progress || {});
        writeStoredProgress(data.progress || {});
        setSyncState("cloud");
      })
      .catch(() => {
        if (!ignore) {
          setSyncState("local");
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const updateProgress = (updater) => {
    setProgress((current) => {
      const next = updater(current);
      writeStoredProgress(next);
      return next;
    });
  };

  const getProblemProgress = useCallback(
    (topicSlug, problemSlug) =>
      progress[getProblemKey(topicSlug, problemSlug)] || {},
    [progress],
  );

  const setProblemStatus = (topicSlug, problemSlug, status) => {
    updateProgress((current) => {
      const key = getProblemKey(topicSlug, problemSlug);
      const nextProblem = {
        ...current[key],
        status,
        lastUpdated: new Date().toISOString(),
      };

      syncProblem(topicSlug, problemSlug, { status });

      return {
        ...current,
        [key]: nextProblem,
      };
    });
  };

  const setProblemNote = (topicSlug, problemSlug, notes) => {
    updateProgress((current) => {
      const key = getProblemKey(topicSlug, problemSlug);
      const nextProblem = {
        ...current[key],
        notes,
        lastUpdated: new Date().toISOString(),
      };

      syncProblem(topicSlug, problemSlug, { notes });

      return {
        ...current,
        [key]: nextProblem,
      };
    });
  };

  const toggleBookmark = (topicSlug, problemSlug) => {
    updateProgress((current) => {
      const key = getProblemKey(topicSlug, problemSlug);
      const currentProblem = current[key] || {};
      const bookmarked = !currentProblem.bookmarked;
      const nextProblem = {
        ...currentProblem,
        bookmarked,
        lastUpdated: new Date().toISOString(),
      };

      syncProblem(topicSlug, problemSlug, { bookmarked });

      return {
        ...current,
        [key]: nextProblem,
      };
    });
  };

  const resetProgress = () => {
    setProgress({});
    localStorage.removeItem(STORAGE_KEY);

    if (localStorage.getItem("token")) {
      resetDSAProgress().catch(() => {});
    }
  };

  const allProblems = useMemo(
    () =>
      dsaTopics.flatMap((topic) =>
        (dsaProblems[topic.slug] || []).map((problem) => ({
          ...problem,
          topicGroup: topic.group,
          topicSlug: topic.slug,
          topicTitle: topic.title,
        })),
      ),
    [],
  );

  const topics = useMemo(
    () =>
      dsaTopics.map((topic) => {
        const problems = dsaProblems[topic.slug] || [];
        const solved = problems.filter((problem) =>
          completedStatuses.has(
            getProblemProgress(topic.slug, problem.slug).status || problem.status,
          ),
        ).length;
        const bookmarked = problems.filter(
          (problem) =>
            getProblemProgress(topic.slug, problem.slug).bookmarked ||
            problem.bookmarked,
        ).length;
        const total = problems.length;

        return {
          ...topic,
          bookmarked,
          solved,
          total,
          progress: total ? Math.round((solved / total) * 100) : 0,
        };
      }),
    [getProblemProgress],
  );

  const stats = useMemo(() => {
    const enrichedProblems = allProblems.map((problem) => {
      const problemProgress = getProblemProgress(problem.topicSlug, problem.slug);

      return {
        ...problem,
        currentStatus: problemProgress.status || problem.status,
        currentBookmarked: problemProgress.bookmarked || problem.bookmarked,
      };
    });
    const solvedProblems = enrichedProblems.filter((problem) =>
      completedStatuses.has(problem.currentStatus),
    );
    const attemptedProblems = enrichedProblems.filter(
      (problem) => problem.currentStatus !== "Not Started",
    );
    const bookmarkedProblems = enrichedProblems.filter(
      (problem) => problem.currentBookmarked,
    );
    const masteredProblems = enrichedProblems.filter(
      (problem) => problem.currentStatus === "Mastered",
    );
    const nextProblems = enrichedProblems
      .filter((problem) => !completedStatuses.has(problem.currentStatus))
      .sort((first, second) => second.importance - first.importance)
      .slice(0, 5);

    return {
      attempted: attemptedProblems.length,
      bookmarked: bookmarkedProblems.length,
      estimatedHours: Math.round(
        enrichedProblems.reduce(
          (total, problem) => total + problem.estimatedTime,
          0,
        ) / 60,
      ),
      mastered: masteredProblems.length,
      nextProblems,
      progress: enrichedProblems.length
        ? Math.round((solvedProblems.length / enrichedProblems.length) * 100)
        : 0,
      solved: solvedProblems.length,
      solvedDifficulty: countByDifficulty(solvedProblems),
      syncState,
      total: enrichedProblems.length,
      totalDifficulty: countByDifficulty(enrichedProblems),
    };
  }, [allProblems, getProblemProgress, syncState]);

  return {
    getProblemProgress,
    resetProgress,
    setProblemNote,
    setProblemStatus,
    stats,
    syncState,
    toggleBookmark,
    topics,
  };
}
