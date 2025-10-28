import { LanguageCode } from "@/lib/types/languages";


export type DifficultyBand = "basic" | "intermediate" | "advanced";

export type PersonalDifficulty = 1 | 2 | 3 | 4 | 5;

export type StudyMode = "free" | "training";

export type LanguageRecord = Record<LanguageCode, string>; 

