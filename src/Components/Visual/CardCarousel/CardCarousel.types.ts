import type { Card } from "@/Components/Service/DB/models/card";
import type { LanguageCode } from "@/lib/types/languages";

export interface CardCarouselProps {
  cards: Card[];
  frontLanguage: LanguageCode;
}
