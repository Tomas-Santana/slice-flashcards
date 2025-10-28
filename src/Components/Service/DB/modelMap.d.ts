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

export type InsertModelMap = {
  decks: Omit<Deck, "id">;
  cards: Omit<Card, "id">;
  settings: Settings;
  sessions: Omit<StudySession, "id">;
  sessionCards: Omit<StudySessionCard, "id">;
  audio: Omit<AudioAsset, "id">;
};

export type StoreName = keyof ModelMap;

export type StoreModel<S extends StoreName> = ModelMap[S];
export type InsertStoreModel<S extends StoreName> = InsertModelMap[S];
