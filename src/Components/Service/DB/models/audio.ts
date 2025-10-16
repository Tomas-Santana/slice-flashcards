import type { EpochMs } from "./common";

export interface AudioAsset {
  id?: number; 
  cardId?: number; 
  blob: Blob;
  mimeType: string; 
  durationSec?: number;
  createdAt: EpochMs;
}
