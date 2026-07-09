import { createDSAProblems } from "./createDSAProblems";

const tries = createDSAProblems("tries", [
  { slug: "implement-trie-prefix-tree", title: "Implement Trie", difficulty: "Medium", stage: "Foundation", pattern: "Trie Design", importance: 5, estimatedTime: 30, companies: ["Amazon", "Google"], leetcode: "https://leetcode.com/problems/implement-trie-prefix-tree/" },
  { slug: "design-add-and-search-words-data-structure", title: "Design Add and Search Words", difficulty: "Medium", stage: "Interview Core", pattern: "Wildcard Trie DFS", importance: 5, estimatedTime: 35, leetcode: "https://leetcode.com/problems/design-add-and-search-words-data-structure/" },
  { slug: "word-search-ii", title: "Word Search II", difficulty: "Hard", stage: "Advanced", pattern: "Trie + Backtracking", importance: 5, estimatedTime: 50, companies: ["Amazon", "Microsoft"], leetcode: "https://leetcode.com/problems/word-search-ii/" },
  { slug: "replace-words", title: "Replace Words", difficulty: "Medium", stage: "Interview Core", pattern: "Prefix Trie", importance: 3, estimatedTime: 25, leetcode: "https://leetcode.com/problems/replace-words/" },
  { slug: "longest-word-in-dictionary", title: "Longest Word in Dictionary", difficulty: "Medium", stage: "Advanced", pattern: "Trie Traversal", importance: 3, estimatedTime: 30, leetcode: "https://leetcode.com/problems/longest-word-in-dictionary/" },
  { slug: "maximum-xor-of-two-numbers-in-an-array", title: "Maximum XOR of Two Numbers", difficulty: "Medium", stage: "Advanced", pattern: "Bit Trie", importance: 4, estimatedTime: 35, leetcode: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/" },
]);

export default tries;
