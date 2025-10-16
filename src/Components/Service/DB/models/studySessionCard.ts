export interface StudySessionCard {
  id: number;
  sessionId: number;
  cardId: number;
  correct: boolean;
  responseTimeMs: number;
  hintUsed: boolean;
}
