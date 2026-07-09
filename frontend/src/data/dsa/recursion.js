import { createDSAProblems } from "./createDSAProblems";

const recursion = createDSAProblems("recursion", [
  { slug: "fibonacci-number", title: "Fibonacci Number", difficulty: "Easy", stage: "Foundation", pattern: "Base Cases", importance: 3, estimatedTime: 10, leetcode: "https://leetcode.com/problems/fibonacci-number/" },
  { slug: "powx-n", title: "Pow(x, n)", difficulty: "Medium", stage: "Foundation", pattern: "Divide and Conquer", importance: 5, estimatedTime: 25, leetcode: "https://leetcode.com/problems/powx-n/" },
  { slug: "reverse-linked-list", title: "Reverse Linked List Recursively", difficulty: "Easy", stage: "Interview Core", pattern: "Recursive Rewire", importance: 4, estimatedTime: 20, leetcode: "https://leetcode.com/problems/reverse-linked-list/" },
  { slug: "merge-two-sorted-lists", title: "Merge Two Sorted Lists Recursively", difficulty: "Easy", stage: "Interview Core", pattern: "Recursive Merge", importance: 4, estimatedTime: 20, leetcode: "https://leetcode.com/problems/merge-two-sorted-lists/" },
  { slug: "k-th-symbol-in-grammar", title: "K-th Symbol in Grammar", difficulty: "Medium", stage: "Advanced", pattern: "Recursive Pattern", importance: 3, estimatedTime: 30, leetcode: "https://leetcode.com/problems/k-th-symbol-in-grammar/" },
  { slug: "different-ways-to-add-parentheses", title: "Different Ways to Add Parentheses", difficulty: "Medium", stage: "Advanced", pattern: "Recursive Splitting", importance: 4, estimatedTime: 35, leetcode: "https://leetcode.com/problems/different-ways-to-add-parentheses/" },
]);

export default recursion;
