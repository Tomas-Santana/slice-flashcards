import type { Card } from "@/Components/Service/DB/models/card";
import type { AnswerComparisonResult } from "@/lib/utils/answerComparison";

export interface PracticeAnswerFormProps {
  currentCard: Card;
  onCorrectAnswer: (result: AnswerComparisonResult) => void;
  onWrongAnswer: (result: AnswerComparisonResult) => void;
}
