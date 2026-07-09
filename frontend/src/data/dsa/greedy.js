import { createDSAProblems } from "./createDSAProblems";

const greedy = createDSAProblems("greedy", [
  { slug: "best-time-to-buy-and-sell-stock", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", stage: "Foundation", pattern: "Running Minimum", importance: 5, estimatedTime: 20, companies: ["Amazon", "Google"], leetcode: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
  { slug: "jump-game", title: "Jump Game", difficulty: "Medium", stage: "Interview Core", pattern: "Reachability", importance: 5, estimatedTime: 25, companies: ["Amazon", "Microsoft"], leetcode: "https://leetcode.com/problems/jump-game/" },
  { slug: "jump-game-ii", title: "Jump Game II", difficulty: "Medium", stage: "Advanced", pattern: "Layered Greedy", importance: 4, estimatedTime: 30, leetcode: "https://leetcode.com/problems/jump-game-ii/" },
  { slug: "gas-station", title: "Gas Station", difficulty: "Medium", stage: "Interview Core", pattern: "Surplus Tracking", importance: 5, estimatedTime: 30, companies: ["Google", "Amazon"], leetcode: "https://leetcode.com/problems/gas-station/" },
  { slug: "partition-labels", title: "Partition Labels", difficulty: "Medium", stage: "Interview Core", pattern: "Interval Merge", importance: 4, estimatedTime: 25, leetcode: "https://leetcode.com/problems/partition-labels/" },
  { slug: "candy", title: "Candy", difficulty: "Hard", stage: "Advanced", pattern: "Two Pass Greedy", importance: 4, estimatedTime: 40, leetcode: "https://leetcode.com/problems/candy/" },
]);

export default greedy;
