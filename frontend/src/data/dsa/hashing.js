import { createProblem } from "../problemTemplate";

const hashing = [
  createProblem({
    id: "hashing-1",
    slug: "contains-duplicate",
    title: "Contains Duplicate",
    difficulty: "Easy",
    stage: "Foundation",
    pattern: "Hash Set",
    importance: 5,
    estimatedTime: 10,
    companies: ["Amazon"],
    leetcode: "https://leetcode.com/problems/contains-duplicate/",
  }),
  createProblem({
    id: "hashing-2",
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    stage: "Foundation",
    pattern: "Hash Map",
    importance: 5,
    estimatedTime: 15,
    companies: ["Amazon", "Google"],
    leetcode: "https://leetcode.com/problems/two-sum/",
  }),
  createProblem({
    id: "hashing-3",
    slug: "top-k-frequent-elements",
    title: "Top K Frequent Elements",
    difficulty: "Medium",
    stage: "Interview Core",
    pattern: "Hash Map + Heap",
    importance: 5,
    estimatedTime: 25,
    companies: ["Amazon", "Meta"],
    leetcode: "https://leetcode.com/problems/top-k-frequent-elements/",
  }),
  createProblem({
    id: "hashing-4",
    slug: "subarray-sum-equals-k",
    title: "Subarray Sum Equals K",
    difficulty: "Medium",
    stage: "Interview Core",
    pattern: "Prefix Sum + Hash Map",
    importance: 5,
    estimatedTime: 30,
    companies: ["Google", "Amazon"],
    leetcode: "https://leetcode.com/problems/subarray-sum-equals-k/",
  }),
];

export default hashing;
