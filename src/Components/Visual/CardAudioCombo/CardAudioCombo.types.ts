export interface CardAudioComboProps {
  onAudioChange?: (audioBlob: Blob | null, mimeType?: string) => void;
  initialAudioBlob?: Blob;
  initialMimeType?: string;
}
