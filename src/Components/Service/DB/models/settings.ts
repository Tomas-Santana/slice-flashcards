import type { EpochMs, LanguageCode } from './common';

export interface Settings {
  id: 'settings'; 
  baseLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  languages: LanguageCode[];
  createdAt: EpochMs;
  updatedAt: EpochMs;
}
