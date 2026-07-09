import { createProblem } from "../problemTemplate";

const linkedList = [
  createProblem({
    id: "linkedlist-1",
    slug: "reverse-linked-list",
    title: "Reverse Linked List",
    difficulty: "Easy",
    stage: "Foundation",
    pattern: "Pointer Reversal",
    importance: 5,
    estimatedTime: 15,
    leetcode: "https://leetcode.com/problems/reverse-linked-list/",
  }),
  createProblem({
    id: "linkedlist-2",
    slug: "linked-list-cycle",
    title: "Linked List Cycle",
    difficulty: "Easy",
    stage: "Foundation",
    pattern: "Fast and Slow Pointers",
    importance: 5,
    estimatedTime: 15,
    leetcode: "https://leetcode.com/problems/linked-list-cycle/",
  }),
  createProblem({
    id: "linkedlist-3",
    slug: "merge-two-sorted-lists",
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    stage: "Interview Core",
    pattern: "Two Pointers",
    importance: 5,
    estimatedTime: 20,
    leetcode: "https://leetcode.com/problems/merge-two-sorted-lists/",
  }),
  createProblem({
    id: "linkedlist-4",
    slug: "remove-nth-node-from-end-of-list",
    title: "Remove Nth Node From End of List",
    difficulty: "Medium",
    stage: "Interview Core",
    pattern: "Two Pointers",
    importance: 4,
    estimatedTime: 25,
    leetcode: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
  }),
];

export default linkedList;
