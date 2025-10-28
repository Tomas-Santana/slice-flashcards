export interface AudioRecorderProps {
  onRecordingComplete?: (blob: Blob, mimeType: string) => void;
}
