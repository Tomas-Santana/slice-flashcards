import type { Card } from "@/Components/Service/DB/models/card";
import type { LanguageCode } from "@/lib/types/languages";

export interface FlashcardListProps {
  cards?: Card[];
  frontLanguage: LanguageCode;
  showFlipButton?: boolean;
  showEditButton?: boolean;
  showProgress?: boolean;
  selectable?: boolean;
  onCardSelected?: (cardId: number, selected: boolean) => void;
  cardSize?: "small" | "normal";
  selected?: number[];
}
