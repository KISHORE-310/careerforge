import { Router, Request, Response } from "express";
import { db } from "../../db/repositories";
import { authenticateToken, optionalAuth, AuthenticatedRequest } from "../auth";
import { aiLimiter, validateBody, sanitizeAiInput } from "../security";
import { DsaSubmitSchema } from "../schemas";
import { aiService } from "../services/ai.service";

export const dsaRouter = Router();

const DEFAULT_DSA_PROBLEMS = [
  {
    id: "two-sum",
    slug: "two-sum",
    topic: "arrays",
    title: "Two Sum & Target Index Map",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target` in O(N) time.",
    starter_code: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
    test_cases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
    ],
    time_complexity: "O(N)",
    space_complexity: "O(N)",
  },
  {
    id: "lru-cache",
    slug: "lru-cache",
    topic: "data-structures",
    title: "LRU Cache Implementation",
    difficulty: "Medium",
    category: "Data Structures",
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) get and put operations.",
    starter_code: `class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n\n  get(key) {\n    if (!this.cache.has(key)) return -1;\n    const val = this.cache.get(key);\n    this.cache.delete(key);\n    this.cache.set(key, val);\n    return val;\n  }\n\n  put(key, value) {\n    if (this.cache.has(key)) {\n      this.cache.delete(key);\n    } else if (this.cache.size >= this.capacity) {\n      const firstKey = this.cache.keys().next().value;\n      this.cache.delete(firstKey);\n    }\n    this.cache.set(key, value);\n  }\n}`,
    test_cases: [{ input: "standard LRU sequence", expected: "pass" }],
    time_complexity: "O(1)",
    space_complexity: "O(Capacity)",
  },
  {
    id: "merge-k-sorted-lists",
    slug: "merge-k-sorted-lists",
    topic: "heaps",
    title: "Merge K Sorted Linked Lists",
    difficulty: "Hard",
    category: "Heaps & Divide and Conquer",
    description: "You are given an array of `k` linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    starter_code: `function mergeKLists(lists) {\n  if (!lists || lists.length === 0) return null;\n  while (lists.length > 1) {\n    const merged = [];\n    for (let i = 0; i < lists.length; i += 2) {\n      const l1 = lists[i];\n      const l2 = i + 1 < lists.length ? lists[i + 1] : null;\n      merged.push(mergeTwoLists(l1, l2));\n    }\n    lists = merged;\n  }\n  return lists[0];\n}`,
    test_cases: [{ input: "[[1,4,5],[1,3,4],[2,6]]", expected: "[1,1,2,3,4,4,5,6]" }],
    time_complexity: "O(N log K)",
    space_complexity: "O(1)",
  },
];

// GET /api/dsa/problems
dsaRouter.get("/problems", async (req: Request, res: Response) => {
  try {
    const { category, difficulty } = req.query;
    let list = DEFAULT_DSA_PROBLEMS;
    if (category) {
      list = list.filter((p) => p.category.toLowerCase().includes((category as string).toLowerCase()));
    }
    if (difficulty) {
      list = list.filter((p) => p.difficulty.toLowerCase() === (difficulty as string).toLowerCase());
    }

    res.json({ success: true, count: list.length, problems: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve DSA problems." });
  }
});

// GET /api/dsa/progress
dsaRouter.get("/progress", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const list = await db.dsa.listByUser(userId);

    const progress: Record<string, any> = {};
    for (const item of list) {
      const key = `${item.topic}:${item.slug}`;
      progress[key] = {
        status: item.status,
        notes: item.notes || "",
        lastUpdated: item.updatedAt.toISOString(),
      };
    }

    res.json({ success: true, progress });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve DSA progress." });
  }
});

// PUT /api/dsa/progress/:topicSlug/:problemSlug
dsaRouter.put("/progress/:topicSlug/:problemSlug", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { topicSlug, problemSlug } = req.params;
    const { status, notes, title, difficulty } = req.body;

    await db.dsa.recordProblem(userId, {
      problemId: `${topicSlug}_${problemSlug}`,
      slug: problemSlug,
      topic: topicSlug,
      title: title || problemSlug.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
      difficulty: difficulty || "Medium",
      status: status || "solved",
      notes: sanitizeAiInput(notes || "", 1000),
    });

    await db.analytics.recordEvent(userId, "dsa_solved", "DSA", {
      topic: topicSlug,
      problem: problemSlug,
    });

    res.json({ success: true, message: "DSA progress updated." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to record DSA progress." });
  }
});

// DELETE /api/dsa/progress
dsaRouter.delete("/progress", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    await db.dsa.resetProgress(userId);
    res.json({ success: true, message: "DSA progress reset successfully." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to reset DSA progress." });
  }
});

// POST /api/dsa/submit
dsaRouter.post(
  "/submit",
  aiLimiter,
  optionalAuth,
  validateBody(DsaSubmitSchema),
  async (req: Request, res: Response) => {
    try {
      const { problem_id, code, language, problem_title } = req.body;
      const userId = (req as any).userId;

      const review = await aiService.reviewDsaCode(
        code,
        problem_title || "Algorithmic Challenge",
        language || "JavaScript"
      );

      if (userId && problem_id) {
        await db.dsa.recordProblem(userId, {
          problemId: problem_id,
          slug: problem_id,
          topic: "algorithms",
          title: problem_title || "DSA Challenge",
          difficulty: "Medium",
          status: review.passed_tests ? "solved" : "attempted",
          notes: review.feedback,
        });

        await db.analytics.recordEvent(userId, "dsa_submission", "DSA", {
          problemId: problem_id,
          passed: review.passed_tests,
        });
      }

      res.json({
        success: true,
        passed: review.passed_tests,
        score: review.score,
        time_complexity: review.time_complexity,
        space_complexity: review.space_complexity,
        strengths: review.strengths,
        suggestions: review.suggestions,
        feedback: review.feedback,
      });
    } catch (error: any) {
      console.error("[DSA Code Review Error]:", error?.message || error);
      const isMissingKey = error?.message?.includes("GEMINI_API_KEY");
      res.status(500).json({
        success: false,
        message: isMissingKey
          ? "DSA AI Code Review requires GEMINI_API_KEY to be configured in server environment."
          : error?.message || "Failed to evaluate code submission.",
      });
    }
  }
);
