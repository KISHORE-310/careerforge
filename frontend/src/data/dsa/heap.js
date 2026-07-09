import { createDSAProblems } from "./createDSAProblems";

const heap = createDSAProblems("heap", [
  { slug: "kth-largest-element-in-an-array", title: "Kth Largest Element in an Array", difficulty: "Medium", stage: "Foundation", pattern: "Min Heap", importance: 5, estimatedTime: 25, companies: ["Amazon"], leetcode: "https://leetcode.com/problems/kth-largest-element-in-an-array/" },
  { slug: "top-k-frequent-elements", title: "Top K Frequent Elements", difficulty: "Medium", stage: "Interview Core", pattern: "Frequency Heap", importance: 5, estimatedTime: 25, companies: ["Amazon", "Meta"], leetcode: "https://leetcode.com/problems/top-k-frequent-elements/" },
  { slug: "find-median-from-data-stream", title: "Find Median from Data Stream", difficulty: "Hard", stage: "Advanced", pattern: "Two Heaps", importance: 5, estimatedTime: 40, companies: ["Google", "Amazon"], leetcode: "https://leetcode.com/problems/find-median-from-data-stream/" },
  { slug: "merge-k-sorted-lists", title: "Merge K Sorted Lists", difficulty: "Hard", stage: "Advanced", pattern: "Priority Queue", importance: 5, estimatedTime: 40, companies: ["Amazon", "Microsoft"], leetcode: "https://leetcode.com/problems/merge-k-sorted-lists/" },
  { slug: "task-scheduler", title: "Task Scheduler", difficulty: "Medium", stage: "Interview Core", pattern: "Heap + Greedy", importance: 4, estimatedTime: 30, leetcode: "https://leetcode.com/problems/task-scheduler/" },
  { slug: "last-stone-weight", title: "Last Stone Weight", difficulty: "Easy", stage: "Foundation", pattern: "Max Heap", importance: 3, estimatedTime: 15, leetcode: "https://leetcode.com/problems/last-stone-weight/" },
]);

export default heap;
