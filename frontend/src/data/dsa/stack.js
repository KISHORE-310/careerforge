import { createDSAProblems } from "./createDSAProblems";

const stack = createDSAProblems("stack", [
  { slug: "valid-parentheses", title: "Valid Parentheses", difficulty: "Easy", stage: "Foundation", pattern: "Matching Stack", importance: 5, estimatedTime: 15, companies: ["Amazon", "Google"], leetcode: "https://leetcode.com/problems/valid-parentheses/" },
  { slug: "min-stack", title: "Min Stack", difficulty: "Medium", stage: "Foundation", pattern: "Design Stack", importance: 5, estimatedTime: 25, leetcode: "https://leetcode.com/problems/min-stack/" },
  { slug: "daily-temperatures", title: "Daily Temperatures", difficulty: "Medium", stage: "Interview Core", pattern: "Monotonic Stack", importance: 5, estimatedTime: 30, companies: ["Amazon"], leetcode: "https://leetcode.com/problems/daily-temperatures/" },
  { slug: "next-greater-element-i", title: "Next Greater Element I", difficulty: "Easy", stage: "Interview Core", pattern: "Monotonic Stack", importance: 4, estimatedTime: 20, leetcode: "https://leetcode.com/problems/next-greater-element-i/" },
  { slug: "evaluate-reverse-polish-notation", title: "Evaluate Reverse Polish Notation", difficulty: "Medium", stage: "Interview Core", pattern: "Expression Stack", importance: 4, estimatedTime: 25, leetcode: "https://leetcode.com/problems/evaluate-reverse-polish-notation/" },
  { slug: "largest-rectangle-in-histogram", title: "Largest Rectangle in Histogram", difficulty: "Hard", stage: "Advanced", pattern: "Monotonic Stack", importance: 5, estimatedTime: 45, companies: ["Google", "Amazon"], leetcode: "https://leetcode.com/problems/largest-rectangle-in-histogram/" },
]);

export default stack;
