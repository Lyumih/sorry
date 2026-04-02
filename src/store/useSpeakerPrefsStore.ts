import { create } from "zustand";
import {
  DEFAULT_SPEAKER_GENDER,
  parseSpeakerGender,
  type SpeakerGender,
} from "../types/speakerGender.ts";

const STORAGE_KEY = "sorry.speakerGender";

function readFromStorage(): SpeakerGender {
  if (typeof localStorage === "undefined") {
    return DEFAULT_SPEAKER_GENDER;
  }
  return parseSpeakerGender(localStorage.getItem(STORAGE_KEY));
}

function writeToStorage(gender: SpeakerGender): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, gender);
}

type SpeakerPrefsState = {
  speakerGender: SpeakerGender;
  setSpeakerGender: (g: SpeakerGender) => void;
};

export const useSpeakerPrefsStore = create<SpeakerPrefsState>((set) => ({
  speakerGender: readFromStorage(),
  setSpeakerGender: (speakerGender) => {
    writeToStorage(speakerGender);
    set({ speakerGender });
  },
}));
