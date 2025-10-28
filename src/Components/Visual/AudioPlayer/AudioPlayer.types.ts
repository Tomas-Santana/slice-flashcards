export interface AudioPlayerProps {
  audioUrl: string;
  onEnded?: () => void;
  compact?: boolean;
}
