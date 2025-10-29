import { Deck } from "@/Components/Service/DB/models/deck";
export interface DeckCardProps {
  deck: Deck;
  showEditButton?: boolean;
  showCardCount?: boolean;
}
