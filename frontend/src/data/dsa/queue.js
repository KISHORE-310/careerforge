import { createDSAProblems } from "./createDSAProblems";

const queue = createDSAProblems("queue", [
  { slug: "implement-queue-using-stacks", title: "Implement Queue using Stacks", difficulty: "Easy", stage: "Foundation", pattern: "Two Stacks", importance: 4, estimatedTime: 20, leetcode: "https://leetcode.com/problems/implement-queue-using-stacks/" },
  { slug: "number-of-recent-calls", title: "Number of Recent Calls", difficulty: "Easy", stage: "Foundation", pattern: "Sliding Queue", importance: 3, estimatedTime: 15, leetcode: "https://leetcode.com/problems/number-of-recent-calls/" },
  { slug: "design-circular-queue", title: "Design Circular Queue", difficulty: "Medium", stage: "Interview Core", pattern: "Circular Buffer", importance: 4, estimatedTime: 30, leetcode: "https://leetcode.com/problems/design-circular-queue/" },
  { slug: "rotting-oranges", title: "Rotting Oranges", difficulty: "Medium", stage: "Interview Core", pattern: "Multi-source BFS", importance: 5, estimatedTime: 30, leetcode: "https://leetcode.com/problems/rotting-oranges/" },
  { slug: "sliding-window-maximum", title: "Sliding Window Maximum", difficulty: "Hard", stage: "Advanced", pattern: "Monotonic Queue", importance: 5, estimatedTime: 40, companies: ["Amazon", "Google"], leetcode: "https://leetcode.com/problems/sliding-window-maximum/" },
  { slug: "shortest-path-in-binary-matrix", title: "Shortest Path in Binary Matrix", difficulty: "Medium", stage: "Advanced", pattern: "BFS Queue", importance: 4, estimatedTime: 35, leetcode: "https://leetcode.com/problems/shortest-path-in-binary-matrix/" },
]);

export default queue;
