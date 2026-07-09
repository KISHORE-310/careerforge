import { createProblem } from "../problemTemplate";

const dp = [
  createProblem({
    id: "dp-1",
    slug: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    stage: "Foundation",
    pattern: "1D DP",
    importance: 5,
    estimatedTime: 15,
    leetcode: "https://leetcode.com/problems/climbing-stairs/",
  }),
  createProblem({
    id: "dp-2",
    slug: "house-robber",
    title: "House Robber",
    difficulty: "Medium",
    stage: "Interview Core",
    pattern: "1D DP",
    importance: 5,
    estimatedTime: 25,
    leetcode: "https://leetcode.com/problems/house-robber/",
  }),
  createProblem({
    id: "dp-3",
    slug: "coin-change",
    title: "Coin Change",
    difficulty: "Medium",
    stage: "Advanced",
    pattern: "Unbounded Knapsack",
    importance: 5,
    estimatedTime: 35,
    leetcode: "https://leetcode.com/problems/coin-change/",
  }),
  createProblem({
    id: "dp-4",
    slug: "longest-increasing-subsequence",
    title: "Longest Increasing Subsequence",
    difficulty: "Medium",
    stage: "Advanced",
    pattern: "DP + Binary Search",
    importance: 5,
    estimatedTime: 35,
    leetcode: "https://leetcode.com/problems/longest-increasing-subsequence/",
  }),
];

export default dp;
