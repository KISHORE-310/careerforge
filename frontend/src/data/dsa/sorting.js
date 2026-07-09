import { createDSAProblems } from "./createDSAProblems";

const sorting = createDSAProblems("sorting", [
  { slug: "sort-colors", title: "Sort Colors", difficulty: "Medium", stage: "Foundation", pattern: "Dutch National Flag", importance: 5, estimatedTime: 20, companies: ["Amazon", "Microsoft"], leetcode: "https://leetcode.com/problems/sort-colors/" },
  { slug: "merge-intervals", title: "Merge Intervals", difficulty: "Medium", stage: "Interview Core", pattern: "Sort + Merge", importance: 5, estimatedTime: 25, companies: ["Amazon", "Google"], leetcode: "https://leetcode.com/problems/merge-intervals/" },
  { slug: "insert-interval", title: "Insert Interval", difficulty: "Medium", stage: "Interview Core", pattern: "Interval Merge", importance: 4, estimatedTime: 25, leetcode: "https://leetcode.com/problems/insert-interval/" },
  { slug: "non-overlapping-intervals", title: "Non-overlapping Intervals", difficulty: "Medium", stage: "Advanced", pattern: "Sort + Greedy", importance: 5, estimatedTime: 30, leetcode: "https://leetcode.com/problems/non-overlapping-intervals/" },
  { slug: "meeting-rooms-ii", title: "Meeting Rooms II", difficulty: "Medium", stage: "Advanced", pattern: "Sweep Line", importance: 4, estimatedTime: 30 },
  { slug: "largest-number", title: "Largest Number", difficulty: "Medium", stage: "Advanced", pattern: "Custom Comparator", importance: 4, estimatedTime: 30, leetcode: "https://leetcode.com/problems/largest-number/" },
]);

export default sorting;
