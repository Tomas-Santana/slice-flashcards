import type { LanguageCode } from '@/lib/types/languages';

export interface Settings {
  id: 'settings'; 
  baseLanguage: LanguageCode;
  selectedLanguage: LanguageCode;
  languages: LanguageCode[];
}
