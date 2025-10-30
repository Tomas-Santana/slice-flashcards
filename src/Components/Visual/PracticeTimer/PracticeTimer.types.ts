export interface PracticeTimerProps {
  // Optional callback when timer updates (called every second)
  onTick?: (seconds: number) => void;
}
