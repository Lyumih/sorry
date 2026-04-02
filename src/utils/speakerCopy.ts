import type { SpeakerGender } from "../types/speakerGender.ts";

/** Глагол после «Я» в нарративной строке и в карточке. */
export function apologyVerbFromMe(gender: SpeakerGender): string {
  return gender === "male" ? "извинился" : "извинилась";
}

/** Плейсхолдер причины, ветка «Я» — про действия автора. */
export function reasonDidWrongPlaceholder(gender: SpeakerGender): string {
  return gender === "male" ? "что сделал не так" : "что сделала не так";
}

/** Плейсхолдер рефлексии автора (обе ветки). */
export function reflectionPlaceholder(gender: SpeakerGender): string {
  return gender === "male"
    ? "что понял, что сделаю иначе"
    : "что поняла, что сделаю иначе";
}

/** Фрагмент для справки: «Я извинился» / «Я извинилась». */
export function helpExampleFromMePhrase(gender: SpeakerGender): string {
  return gender === "male" ? "Я извинился…" : "Я извинилась…";
}
