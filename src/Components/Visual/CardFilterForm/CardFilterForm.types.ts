import type { FilterCriteria } from "@/lib/types/filter";

export interface CardFilterFormProps {
  onFilterChange: (criteria: FilterCriteria) => void;
}
