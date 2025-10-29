import { Deck } from "@/Components/Service/DB/models/deck";

export interface DeckListProps {
  decks?: Deck[];
  showEditButton?: boolean;
  showCardCount?: boolean;
  showRandomPracticeDeck?: boolean;
}
