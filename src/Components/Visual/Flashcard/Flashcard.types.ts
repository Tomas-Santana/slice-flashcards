import { Card } from "@/Components/Service/DB/models/card"
import { LanguageCode } from "@/lib/types/languages"

export interface FlashcardProps {
  card: Card
  frontLanguage: LanguageCode
  showFlipButton?: boolean
  selectable?: boolean
  onSelectChange?: (selected: boolean) => void
}
