import { createDSAProblems } from "./createDSAProblems";

const slidingWindow = createDSAProblems("slidingwindow", [
  { slug: "maximum-average-subarray-i", title: "Maximum Average Subarray I", difficulty: "Easy", stage: "Foundation", pattern: "Fixed Window", importance: 3, estimatedTime: 15, leetcode: "https://leetcode.com/problems/maximum-average-subarray-i/" },
  { slug: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", stage: "Interview Core", pattern: "Variable Window", importance: 5, estimatedTime: 25, companies: ["Amazon", "Google"], leetcode: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
  { slug: "minimum-window-substring", title: "Minimum Window Substring", difficulty: "Hard", stage: "Advanced", pattern: "Frequency Window", importance: 5, estimatedTime: 45, companies: ["Google", "Meta"], leetcode: "https://leetcode.com/problems/minimum-window-substring/" },
  { slug: "permutation-in-string", title: "Permutation in String", difficulty: "Medium", stage: "Interview Core", pattern: "Window Frequency", importance: 4, estimatedTime: 30, leetcode: "https://leetcode.com/problems/permutation-in-string/" },
  { slug: "longest-repeating-character-replacement", title: "Longest Repeating Character Replacement", difficulty: "Medium", stage: "Interview Core", pattern: "Max Frequency Window", importance: 5, estimatedTime: 30, leetcode: "https://leetcode.com/problems/longest-repeating-character-replacement/" },
  { slug: "sliding-window-maximum", title: "Sliding Window Maximum", difficulty: "Hard", stage: "Advanced", pattern: "Monotonic Deque", importance: 5, estimatedTime: 40, leetcode: "https://leetcode.com/problems/sliding-window-maximum/" },
]);

export default slidingWindow;
