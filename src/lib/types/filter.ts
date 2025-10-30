import { DifficultyBand } from "@/Components/Service/DB/models/common";

export interface FilterCriteria {
  difficultyBands: DifficultyBand[];
  searchTerm?: string;
  searchFor: 'front' | 'back' | 'both';
}