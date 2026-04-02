import type { ApologyDirection } from "../types/apologyEntry.ts";
import type { SpeakerGender } from "../types/speakerGender.ts";
import { apologyVerbFromMe } from "./speakerCopy.ts";

type NarrativeFields = {
  direction: ApologyDirection;
  toWhom: string;
  reason: string;
  reflection: string;
};

/** Пустое значение в тексте — многоточие. */
function segment(s: string): string {
  const t = s.trim();
  return t || "…";
}

/**
 * Связное предложение для карточки (направление «Я» / «Мне»).
 */
export function buildApologyNarrative(
  fields: NarrativeFields,
  speakerGender: SpeakerGender,
): string {
  const { direction, toWhom, reason, reflection } = fields;
  const whom = toWhom.trim();
  const r = reason.trim();
  const ref = reflection.trim();

  if (direction === "i_said") {
    const verb = apologyVerbFromMe(speakerGender);
    const head = `Я ${verb} перед ${segment(whom)} за ${segment(r)}`;
    const tail = ref ? `. Мои выводы на будущее — ${segment(ref)}` : "";
    return `${head}${tail}.`;
  }

  const head = `У меня извинился(лась) ${segment(whom)} за ${segment(r)}`;
  const tail = ref ? `. Мои выводы на будущее — ${segment(ref)}` : "";
  return `${head}${tail}.`;
}
