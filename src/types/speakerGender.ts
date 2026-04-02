export type SpeakerGender = "male" | "female";

export const DEFAULT_SPEAKER_GENDER: SpeakerGender = "male";

export function parseSpeakerGender(raw: string | null): SpeakerGender {
  return raw === "female" ? "female" : "male";
}
