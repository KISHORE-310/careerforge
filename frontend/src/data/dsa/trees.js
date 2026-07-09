import { createProblem } from "../problemTemplate";

const trees = [
  createProblem({
    id: "trees-1",
    slug: "maximum-depth-of-binary-tree",
    title: "Maximum Depth of Binary Tree",
    difficulty: "Easy",
    stage: "Foundation",
    pattern: "DFS",
    importance: 5,
    estimatedTime: 15,
    leetcode: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
  }),
  createProblem({
    id: "trees-2",
    slug: "invert-binary-tree",
    title: "Invert Binary Tree",
    difficulty: "Easy",
    stage: "Foundation",
    pattern: "DFS",
    importance: 4,
    estimatedTime: 15,
    leetcode: "https://leetcode.com/problems/invert-binary-tree/",
  }),
  createProblem({
    id: "trees-3",
    slug: "binary-tree-level-order-traversal",
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    stage: "Interview Core",
    pattern: "BFS",
    importance: 5,
    estimatedTime: 25,
    leetcode: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
  }),
  createProblem({
    id: "trees-4",
    slug: "lowest-common-ancestor-of-a-binary-tree",
    title: "Lowest Common Ancestor of a Binary Tree",
    difficulty: "Medium",
    stage: "Advanced",
    pattern: "Tree Recursion",
    importance: 5,
    estimatedTime: 30,
    leetcode: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
  }),
];

export default trees;
