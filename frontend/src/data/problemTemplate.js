export function createProblem({
  id,
  slug,
  title,
  difficulty,
  stage,
  pattern,
  importance,
  companies = [],
  estimatedTime = 20,
  leetcode = "",
  article = "",
  video = "",
}) {
  return {
    // Basic Information
    id,
    slug,
    title,
    difficulty,
    stage,
    pattern,
    importance,

    // Resources
    companies,
    estimatedTime,
    leetcode,
    article,
    video,

    // User Progress
    status: "Not Started", // Not Started | Attempted | Solved | Revised | Mastered

    bookmarked: false,

    revisionCount: 0,

    notes: "",

    lastSolved: null,

    lastRevised: null,
  };
}