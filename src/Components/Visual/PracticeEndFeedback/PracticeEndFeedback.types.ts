export interface SessionStats {
  correct: number;
  incorrect: number;
  accuracy: number;
}

export interface PracticeEndFeedbackProps {
  stats: SessionStats;
  timeElapsed?: string; // Optional formatted time string (e.g., "02:35")
}
