import type { LanguageCode } from '@/lib/types/languages';

export interface Settings {
  id: 'settings'; 
  name: string;
  baseLanguage: LanguageCode;
  selectedLanguage: LanguageCode;
  languages: LanguageCode[];
}
