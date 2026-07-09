import { createProblem } from "../problemTemplate";

const binarySearch = [
  createProblem({
    id: "binarysearch-1",
    slug: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    stage: "Foundation",
    pattern: "Classic Search",
    importance: 5,
    estimatedTime: 15,
    leetcode: "https://leetcode.com/problems/binary-search/",
  }),
  createProblem({
    id: "binarysearch-2",
    slug: "search-in-rotated-sorted-array",
    title: "Search in Rotated Sorted Array",
    difficulty: "Medium",
    stage: "Interview Core",
    pattern: "Modified Binary Search",
    importance: 5,
    estimatedTime: 25,
    companies: ["Amazon", "Microsoft"],
    leetcode: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
  }),
  createProblem({
    id: "binarysearch-3",
    slug: "find-minimum-in-rotated-sorted-array",
    title: "Find Minimum in Rotated Sorted Array",
    difficulty: "Medium",
    stage: "Interview Core",
    pattern: "Modified Binary Search",
    importance: 4,
    estimatedTime: 20,
    leetcode: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
  }),
  createProblem({
    id: "binarysearch-4",
    slug: "koko-eating-bananas",
    title: "Koko Eating Bananas",
    difficulty: "Medium",
    stage: "Advanced",
    pattern: "Binary Search on Answer",
    importance: 5,
    estimatedTime: 30,
    companies: ["Google"],
    leetcode: "https://leetcode.com/problems/koko-eating-bananas/",
  }),
];

export default binarySearch;
