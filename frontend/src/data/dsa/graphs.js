import { createProblem } from "../problemTemplate";

const graphs = [
  createProblem({
    id: "graphs-1",
    slug: "number-of-islands",
    title: "Number of Islands",
    difficulty: "Medium",
    stage: "Interview Core",
    pattern: "DFS / BFS",
    importance: 5,
    estimatedTime: 30,
    companies: ["Amazon", "Google"],
    leetcode: "https://leetcode.com/problems/number-of-islands/",
  }),
  createProblem({
    id: "graphs-2",
    slug: "clone-graph",
    title: "Clone Graph",
    difficulty: "Medium",
    stage: "Interview Core",
    pattern: "Graph Traversal",
    importance: 4,
    estimatedTime: 30,
    leetcode: "https://leetcode.com/problems/clone-graph/",
  }),
  createProblem({
    id: "graphs-3",
    slug: "course-schedule",
    title: "Course Schedule",
    difficulty: "Medium",
    stage: "Advanced",
    pattern: "Topological Sort",
    importance: 5,
    estimatedTime: 35,
    leetcode: "https://leetcode.com/problems/course-schedule/",
  }),
  createProblem({
    id: "graphs-4",
    slug: "rotting-oranges",
    title: "Rotting Oranges",
    difficulty: "Medium",
    stage: "Interview Core",
    pattern: "Multi-source BFS",
    importance: 4,
    estimatedTime: 30,
    leetcode: "https://leetcode.com/problems/rotting-oranges/",
  }),
];

export default graphs;
