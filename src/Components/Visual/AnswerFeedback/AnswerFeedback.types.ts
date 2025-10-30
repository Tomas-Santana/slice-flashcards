import type { AnswerComparisonResult } from "@/lib/utils/answerComparison";

export interface AnswerFeedbackProps {
  result: AnswerComparisonResult;
  isCorrect: boolean;
}
