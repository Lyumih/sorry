/** Направление извинения (PRD §8): я сказал(а) кому-то / мне сказали. */
export type ApologyDirection = "i_said" | "said_to_me";

/** Запись дневника извинений (PRD §8). Одна формулировка для всех записей: «Прости, Извини». */
export interface ApologyEntry {
  id: string;
  /** Момент события, ISO 8601. */
  createdAt: string;
  direction: ApologyDirection;
  toWhom: string;
  reason: string;
  reflection: string;
}

/** Данные для создания записи: `id` задаётся при сохранении в IndexedDB. */
export type NewApologyEntry = Omit<ApologyEntry, "id">;
