import { createDSAProblems } from "./createDSAProblems";

const bitManipulation = createDSAProblems("bit", [
  { slug: "single-number", title: "Single Number", difficulty: "Easy", stage: "Foundation", pattern: "XOR", importance: 5, estimatedTime: 15, companies: ["Amazon"], leetcode: "https://leetcode.com/problems/single-number/" },
  { slug: "number-of-1-bits", title: "Number of 1 Bits", difficulty: "Easy", stage: "Foundation", pattern: "Bit Counting", importance: 4, estimatedTime: 15, leetcode: "https://leetcode.com/problems/number-of-1-bits/" },
  { slug: "counting-bits", title: "Counting Bits", difficulty: "Easy", stage: "Interview Core", pattern: "DP on Bits", importance: 4, estimatedTime: 20, leetcode: "https://leetcode.com/problems/counting-bits/" },
  { slug: "reverse-bits", title: "Reverse Bits", difficulty: "Easy", stage: "Foundation", pattern: "Bit Shifting", importance: 3, estimatedTime: 20, leetcode: "https://leetcode.com/problems/reverse-bits/" },
  { slug: "sum-of-two-integers", title: "Sum of Two Integers", difficulty: "Medium", stage: "Advanced", pattern: "Bitwise Addition", importance: 4, estimatedTime: 30, companies: ["Amazon"], leetcode: "https://leetcode.com/problems/sum-of-two-integers/" },
  { slug: "maximum-xor-of-two-numbers-in-an-array", title: "Maximum XOR of Two Numbers", difficulty: "Medium", stage: "Advanced", pattern: "Bit Trie", importance: 4, estimatedTime: 35, leetcode: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/" },
]);

export default bitManipulation;
