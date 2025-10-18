
export interface AudioAsset {
  id: number; 
  blob: Blob;
  mimeType: string; 
  durationSec?: number;
  createdAt: Date;
}
