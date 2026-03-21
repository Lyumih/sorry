/** Тип фразы извинения (PRD §8). */
export type PhraseType = "prosti" | "izvini" | "both";

/** Запись дневника извинений (PRD §8). */
export interface ApologyEntry {
  id: string;
  /** Момент события, ISO 8601. */
  createdAt: string;
  phraseType: PhraseType;
  toWhom: string;
  reason: string;
  reflection: string;
}

/** Данные для создания записи: `id` задаётся при сохранении в IndexedDB. */
export type NewApologyEntry = Omit<ApologyEntry, "id">;
