import { AudioAsset } from "./models/audio";
import { Deck } from "./models/deck";
import { Card } from "./models/card";
import { StudySessionCard } from "./models/studySessionCard";
import { StudySession } from "./models/studySession";
import { Settings } from "./models/settings";

export type ModelMap = {
  decks: Deck;
  cards: Card;
  settings: Settings;
  sessions: StudySession;
  sessionCards: StudySessionCard;
  audio: AudioAsset;
};

export type StoreName = keyof ModelMap;

export type StoreModel<S extends StoreName> = ModelMap[S];
