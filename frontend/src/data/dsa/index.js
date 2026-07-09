import arrays from "./arrays";
import backtracking from "./backtracking";
import binarySearch from "./binarySearch";
import bitManipulation from "./bitManipulation";
import bst from "./bst";
import dp from "./dp";
import graphs from "./graphs";
import greedy from "./greedy";
import hashing from "./hashing";
import heap from "./heap";
import linkedList from "./linkedList";
import math from "./math";
import queue from "./queue";
import recursion from "./recursion";
import slidingWindow from "./slidingWindow";
import sorting from "./sorting";
import stack from "./stack";
import strings from "./strings";
import trees from "./trees";
import tries from "./tries";
import twoPointers from "./twoPointers";

export const dsaTopics = [
  { slug: "arrays", title: "Arrays", group: "Core Data Structures", priority: "Start Here", description: "Traversal, prefix sums, intervals, matrices" },
  { slug: "strings", title: "Strings", group: "Core Data Structures", priority: "Start Here", description: "Palindromes, windows, anagrams, parsing" },
  { slug: "hashing", title: "Hashing", group: "Core Data Structures", priority: "Start Here", description: "Maps, sets, frequency and prefix lookups" },
  { slug: "twoPointers", title: "Two Pointers", group: "Patterns", priority: "Start Here", description: "Opposite ends, write pointers, sorted scans" },
  { slug: "slidingWindow", title: "Sliding Window", group: "Patterns", priority: "Interview Core", description: "Fixed, variable, and frequency windows" },
  { slug: "binarysearch", title: "Binary Search", group: "Patterns", priority: "Interview Core", description: "Classic search and answer-space search" },
  { slug: "sorting", title: "Sorting & Intervals", group: "Patterns", priority: "Interview Core", description: "Comparator logic, sweeps, interval merging" },
  { slug: "linkedlist", title: "Linked List", group: "Core Data Structures", priority: "Interview Core", description: "Pointers, cycles, reversal and merging" },
  { slug: "stack", title: "Stack", group: "Core Data Structures", priority: "Interview Core", description: "Matching, expression parsing, monotonic stacks" },
  { slug: "queue", title: "Queue & BFS", group: "Core Data Structures", priority: "Interview Core", description: "Queues, circular buffers, BFS expansion" },
  { slug: "recursion", title: "Recursion", group: "Foundations", priority: "Foundation", description: "Base cases, recursive splitting, divide and conquer" },
  { slug: "backtracking", title: "Backtracking", group: "Advanced Patterns", priority: "Advanced", description: "Subsets, permutations, boards, constraint search" },
  { slug: "trees", title: "Binary Trees", group: "Trees & Graphs", priority: "Interview Core", description: "DFS, BFS, recursion and ancestors" },
  { slug: "bst", title: "BST", group: "Trees & Graphs", priority: "Interview Core", description: "Ordered tree search, validation, kth elements" },
  { slug: "heap", title: "Heap / Priority Queue", group: "Core Data Structures", priority: "Advanced", description: "Top K, scheduling, two heaps, merging" },
  { slug: "graphs", title: "Graphs", group: "Trees & Graphs", priority: "Advanced", description: "Traversal, grids and topological ordering" },
  { slug: "tries", title: "Tries", group: "Advanced Data Structures", priority: "Advanced", description: "Prefix trees, wildcard search, word grids" },
  { slug: "dynamicprogramming", title: "Dynamic Programming", group: "Advanced Patterns", priority: "Advanced", description: "1D DP, choices, knapsack, subsequences" },
  { slug: "greedy", title: "Greedy", group: "Patterns", priority: "Interview Core", description: "Local choices, intervals, reachability, surplus" },
  { slug: "bitManipulation", title: "Bit Manipulation", group: "Foundations", priority: "Advanced", description: "XOR, masks, bit counting and bit tries" },
  { slug: "math", title: "Math & Matrix", group: "Foundations", priority: "Foundation", description: "Digits, powers, matrix transforms and geometry" },
];

const dsaProblems = {
  arrays,
  strings,
  hashing,
  twoPointers,
  slidingWindow,
  binarysearch: binarySearch,
  sorting,
  linkedlist: linkedList,
  stack,
  queue,
  recursion,
  backtracking,
  trees,
  bst,
  heap,
  graphs,
  tries,
  dynamicprogramming: dp,
  greedy,
  bitManipulation,
  math,
};

export default dsaProblems;
