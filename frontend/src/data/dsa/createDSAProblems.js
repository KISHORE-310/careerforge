import { createProblem } from "../problemTemplate";

export function createDSAProblems(topicPrefix, problems) {
  return problems.map((problem, index) =>
    createProblem({
      id: `${topicPrefix}-${index + 1}`,
      ...problem,
    }),
  );
}
