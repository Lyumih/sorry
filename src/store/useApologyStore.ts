import { create } from "zustand";
import type { ApologyEntry, NewApologyEntry } from "../types/apologyEntry.ts";
import {
  addEntry as dbAdd,
  deleteEntry as dbDelete,
  getAllEntries,
  updateEntry as dbUpdate,
} from "../db/apologyRepository.ts";

type ApologyStore = {
  entries: ApologyEntry[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  add: (entry: NewApologyEntry) => Promise<ApologyEntry>;
  update: (entry: ApologyEntry) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

async function refresh(): Promise<ApologyEntry[]> {
  return getAllEntries();
}

export const useApologyStore = create<ApologyStore>((set) => ({
  entries: [],
  hydrated: false,

  hydrate: async () => {
    const entries = await refresh();
    set({ entries, hydrated: true });
  },

  add: async (entry) => {
    const created = await dbAdd(entry);
    const entries = await refresh();
    set({ entries });
    return created;
  },

  update: async (entry) => {
    await dbUpdate(entry);
    const entries = await refresh();
    set({ entries });
  },

  remove: async (id) => {
    await dbDelete(id);
    const entries = await refresh();
    set({ entries });
  },
}));
