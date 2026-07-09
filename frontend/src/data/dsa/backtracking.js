import { createDSAProblems } from "./createDSAProblems";

const backtracking = createDSAProblems("backtracking", [
  { slug: "subsets", title: "Subsets", difficulty: "Medium", stage: "Foundation", pattern: "Pick / Not Pick", importance: 5, estimatedTime: 25, companies: ["Amazon", "Google"], leetcode: "https://leetcode.com/problems/subsets/" },
  { slug: "combination-sum", title: "Combination Sum", difficulty: "Medium", stage: "Interview Core", pattern: "Recursive Search", importance: 5, estimatedTime: 30, companies: ["Amazon", "Microsoft"], leetcode: "https://leetcode.com/problems/combination-sum/" },
  { slug: "permutations", title: "Permutations", difficulty: "Medium", stage: "Interview Core", pattern: "State Swapping", importance: 5, estimatedTime: 30, companies: ["Google", "Adobe"], leetcode: "https://leetcode.com/problems/permutations/" },
  { slug: "palindrome-partitioning", title: "Palindrome Partitioning", difficulty: "Medium", stage: "Advanced", pattern: "Partition Backtracking", importance: 4, estimatedTime: 35, companies: ["Amazon"], leetcode: "https://leetcode.com/problems/palindrome-partitioning/" },
  { slug: "n-queens", title: "N-Queens", difficulty: "Hard", stage: "Advanced", pattern: "Constraint Search", importance: 4, estimatedTime: 45, companies: ["Google"], leetcode: "https://leetcode.com/problems/n-queens/" },
  { slug: "word-search", title: "Word Search", difficulty: "Medium", stage: "Interview Core", pattern: "Grid Backtracking", importance: 5, estimatedTime: 30, companies: ["Amazon", "Microsoft"], leetcode: "https://leetcode.com/problems/word-search/" },
]);

export default backtracking;
