import { createDSAProblems } from "./createDSAProblems";

const bst = createDSAProblems("bst", [
  { slug: "search-in-a-binary-search-tree", title: "Search in a Binary Search Tree", difficulty: "Easy", stage: "Foundation", pattern: "BST Property", importance: 4, estimatedTime: 15, leetcode: "https://leetcode.com/problems/search-in-a-binary-search-tree/" },
  { slug: "validate-binary-search-tree", title: "Validate Binary Search Tree", difficulty: "Medium", stage: "Interview Core", pattern: "Range Validation", importance: 5, estimatedTime: 25, companies: ["Amazon", "Microsoft"], leetcode: "https://leetcode.com/problems/validate-binary-search-tree/" },
  { slug: "kth-smallest-element-in-a-bst", title: "Kth Smallest Element in a BST", difficulty: "Medium", stage: "Interview Core", pattern: "Inorder Traversal", importance: 5, estimatedTime: 25, companies: ["Amazon"], leetcode: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/" },
  { slug: "lowest-common-ancestor-of-a-binary-search-tree", title: "LCA of a BST", difficulty: "Medium", stage: "Interview Core", pattern: "BST Walk", importance: 4, estimatedTime: 20, leetcode: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/" },
  { slug: "insert-into-a-binary-search-tree", title: "Insert into a BST", difficulty: "Medium", stage: "Foundation", pattern: "BST Mutation", importance: 3, estimatedTime: 20, leetcode: "https://leetcode.com/problems/insert-into-a-binary-search-tree/" },
  { slug: "delete-node-in-a-bst", title: "Delete Node in a BST", difficulty: "Medium", stage: "Advanced", pattern: "BST Mutation", importance: 4, estimatedTime: 35, leetcode: "https://leetcode.com/problems/delete-node-in-a-bst/" },
]);

export default bst;
