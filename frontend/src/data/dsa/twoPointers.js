import { createDSAProblems } from "./createDSAProblems";

const twoPointers = createDSAProblems("twopointers", [
  { slug: "valid-palindrome", title: "Valid Palindrome", difficulty: "Easy", stage: "Foundation", pattern: "Opposite Ends", importance: 5, estimatedTime: 15, leetcode: "https://leetcode.com/problems/valid-palindrome/" },
  { slug: "two-sum-ii-input-array-is-sorted", title: "Two Sum II", difficulty: "Medium", stage: "Foundation", pattern: "Sorted Two Pointers", importance: 5, estimatedTime: 20, leetcode: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/" },
  { slug: "container-with-most-water", title: "Container With Most Water", difficulty: "Medium", stage: "Interview Core", pattern: "Greedy Pointers", importance: 5, estimatedTime: 25, companies: ["Amazon", "Google"], leetcode: "https://leetcode.com/problems/container-with-most-water/" },
  { slug: "3sum", title: "3Sum", difficulty: "Medium", stage: "Interview Core", pattern: "Sort + Two Pointers", importance: 5, estimatedTime: 30, companies: ["Amazon", "Meta"], leetcode: "https://leetcode.com/problems/3sum/" },
  { slug: "trapping-rain-water", title: "Trapping Rain Water", difficulty: "Hard", stage: "Advanced", pattern: "Boundary Pointers", importance: 5, estimatedTime: 40, companies: ["Google", "Amazon"], leetcode: "https://leetcode.com/problems/trapping-rain-water/" },
  { slug: "remove-duplicates-from-sorted-array", title: "Remove Duplicates from Sorted Array", difficulty: "Easy", stage: "Foundation", pattern: "Write Pointer", importance: 5, estimatedTime: 15, leetcode: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/" },
]);

export default twoPointers;
