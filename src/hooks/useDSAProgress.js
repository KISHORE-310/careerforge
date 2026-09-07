import { useState, useEffect } from "react";
import { getDSACatalog, getDSAProgress, updateDSAProgress, resetDSAProgress } from "../services/api";

export function useDSAProgress() {
  const [progressState, setProgressState] = useState({ problems: {} });
  const [catalog, setCatalog] = useState({ topics: [], problems: {} });
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  useEffect(() => {
    getDSACatalog().then((result) => {
      if (result?.success) setCatalog({ topics: result.topics || [], problems: result.problems || {} });
      else setCatalogError(result?.message || "Unable to load the practice catalog.");
    }).catch(() => setCatalogError("Unable to load the practice catalog.")).finally(() => setCatalogLoading(false));
    getDSAProgress().then((result) => {
      if (result.success) {
        const problems = {};
        Object.entries(result.progress || {}).forEach(([key, value]) => {
          const [topic, problem] = key.split(":");
          problems[topic] = { ...(problems[topic] || {}), [problem]: value };
        });
        setProgressState({ problems });
      }
    }).catch(() => setProgressState({ problems: {} }));
  }, []);

  const persist = (topicSlug, problemId, patch) => {
    const current = progressState.problems?.[topicSlug]?.[problemId] || { status: "unsolved", bookmarked: false, notes: "" };
    const next = { ...current, ...patch };
    setProgressState((previous) => ({ ...previous, problems: { ...previous.problems, [topicSlug]: { ...(previous.problems?.[topicSlug] || {}), [problemId]: next } } }));
    updateDSAProgress(topicSlug, problemId, next).catch(() => {});
  };

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
    persist(topicSlug, problemId, { status });
  };

  const toggleBookmark = (topicSlug, problemId) => {
    const current = progressState.problems?.[topicSlug]?.[problemId] || { bookmarked: false };
    persist(topicSlug, problemId, { bookmarked: !current.bookmarked });
  };

  const setProblemNote = (topicSlug, problemId, notes) => {
    persist(topicSlug, problemId, { notes });
  };

  const resetProgress = () => {
    setProgressState({ problems: {} });
    resetDSAProgress().catch(() => {});
  };

  // Calculate detailed stats and topic progresses
  let totalProblems = 0;
  let totalSolved = 0;
  let masteredCount = 0;
  let totalMinutes = 0;
  let solvedMinutes = 0;

  const topics = catalog.topics.map((topic) => {
    const topicProblemList = catalog.problems[topic.slug] || [];
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
    solvedHours: Math.round(solvedMinutes / 60),
    totalHours: Math.round(totalMinutes / 60),
  };

  return {
    progressState,
    getProblemProgress,
    setProblemStatus,
    toggleBookmark,
    setProblemNote,
    resetProgress,
    topics,
    catalog,
    catalogLoading,
    catalogError,
    stats,
  };
}
