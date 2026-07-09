import { createDSAProblems } from "./createDSAProblems";

const math = createDSAProblems("math", [
  { slug: "palindrome-number", title: "Palindrome Number", difficulty: "Easy", stage: "Foundation", pattern: "Digit Reversal", importance: 3, estimatedTime: 15, leetcode: "https://leetcode.com/problems/palindrome-number/" },
  { slug: "powx-n", title: "Pow(x, n)", difficulty: "Medium", stage: "Interview Core", pattern: "Fast Exponentiation", importance: 5, estimatedTime: 25, companies: ["Google"], leetcode: "https://leetcode.com/problems/powx-n/" },
  { slug: "sqrtx", title: "Sqrt(x)", difficulty: "Easy", stage: "Foundation", pattern: "Binary Search Math", importance: 4, estimatedTime: 20, leetcode: "https://leetcode.com/problems/sqrtx/" },
  { slug: "happy-number", title: "Happy Number", difficulty: "Easy", stage: "Foundation", pattern: "Cycle Detection", importance: 3, estimatedTime: 20, leetcode: "https://leetcode.com/problems/happy-number/" },
  { slug: "rotate-image", title: "Rotate Image", difficulty: "Medium", stage: "Interview Core", pattern: "Matrix Math", importance: 5, estimatedTime: 25, companies: ["Amazon", "Microsoft"], leetcode: "https://leetcode.com/problems/rotate-image/" },
  { slug: "max-points-on-a-line", title: "Max Points on a Line", difficulty: "Hard", stage: "Advanced", pattern: "Slope Hashing", importance: 4, estimatedTime: 45, leetcode: "https://leetcode.com/problems/max-points-on-a-line/" },
]);

export default math;
