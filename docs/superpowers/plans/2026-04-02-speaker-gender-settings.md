# Speaker gender settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить локальную настройку «Мужчина / Женщина» (по умолчанию мужчина) с иконкой в шапке перед справкой, синхронизацией в `localStorage` (`sorry.speakerGender`), и согласованием формулировок в форме, `buildApologyNarrative`, ленте и справке по спеке `docs/superpowers/specs/2026-04-02-speaker-gender-settings-design.md`.

**Architecture:** Отдельный Zustand-store для преференса с записью в `localStorage` под фиксированным ключом. Общие строковые фрагменты (глагол для ветки «Я», плейсхолдеры про автора) — в одном модуле-хелпере; `buildApologyNarrative(fields, speakerGender)` использует те же правила, что и UI. Ветка «У меня»: глагол **извинился(лась)** без подстановки пола ведущего; плейсхолдер причины нейтральный; плейсхолдер рефлексии — **понял/поняла** от пола автора.

**Tech Stack:** React 19, TypeScript, Vite 8, Zustand 5, Ant Design 6, Vitest (добавляется для юнит-тестов чистых функций).

---

## File map

| File | Role |
|------|------|
| `package.json` | Скрипт `test`, devDependency `vitest` |
| `vite.config.ts` | Секция `test` для Vitest |
| `src/types/speakerGender.ts` | Тип `SpeakerGender`, константа по умолчанию |
| `src/utils/speakerCopy.ts` | Функции: глагол «Я извинился/извинилась», плейсхолдеры `reasonDidWrongPlaceholder`, `reflectionPlaceholder`, фрагмент для справки |
| `src/utils/apologyNarrative.ts` | `buildApologyNarrative(fields, speakerGender)` + ветка `said_to_me` как в UI |
| `src/utils/apologyNarrative.test.ts` | Тесты нарратива |
| `src/store/useSpeakerPrefsStore.ts` | Zustand: `speakerGender`, `setSpeakerGender`, гидратация из `localStorage` при создании |
| `src/components/SettingsModal.tsx` | Modal с `Radio.Group` Мужчина/Женщина, мгновенное сохранение |
| `src/App.tsx` | Кнопка `SettingOutlined` перед справкой, состояние открытия модалки, рендер `SettingsModal` |
| `src/components/ApologyForm.tsx` | Подписка на store, динамические span/placeholder по ветке |
| `src/components/EntryList.tsx` | Подписка на store, передача пола в `buildApologyNarrative` |
| `src/components/HelpModal.tsx` | Подписка на store или проп `speakerGender` из родителя — проще хук внутри модалки |
| `tasks.json` | T12 → `in_progress` / `done`, `notes` |

---

### Task 1: Vitest и скрипт тестов

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`

- [ ] **Step 1: Установить Vitest**

Run:

```bash
npm install -D vitest
```

Expected: `package.json` / `package-lock.json` обновлены.

- [ ] **Step 2: Добавить скрипт и конфиг тестов**

В `package.json` в `scripts`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

В `vite.config.ts` импортировать `defineConfig` из `vitest/config` (или использовать `/// <reference types="vitest/config" />` и объединить конфиг). Пример:

```ts
import { defineConfig } from "vitest/config";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  test: {
    globals: false,
    include: ["src/**/*.test.ts"],
  },
});
```

Убедиться, что `npm run build` по-прежнему проходит (плагины те же).

- [ ] **Step 3: Проверка**

Run: `npm run test`  
Expected: `No test files found` или пустой успешный прогон (до добавления файла тестов).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json vite.config.ts
git commit -m "chore: add vitest for unit tests"
```

---

### Task 2: Тип пола и модуль строк (TDD — тесты нарратива падают)

**Files:**
- Create: `src/types/speakerGender.ts`
- Create: `src/utils/speakerCopy.ts`
- Create: `src/utils/apologyNarrative.test.ts`
- Modify: `src/utils/apologyNarrative.ts` (минимальная заглушка или сразу сигнатура с полом)

- [ ] **Step 1: Тип по умолчанию**

`src/types/speakerGender.ts`:

```ts
export type SpeakerGender = "male" | "female";

export const DEFAULT_SPEAKER_GENDER: SpeakerGender = "male";

export function parseSpeakerGender(raw: string | null): SpeakerGender {
  return raw === "female" ? "female" : "male";
}
```

- [ ] **Step 2: Хелперы копирайта**

`src/utils/speakerCopy.ts`:

```ts
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
```

- [ ] **Step 3: Написать падающие тесты для `buildApologyNarrative`**

`src/utils/apologyNarrative.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildApologyNarrative } from "./apologyNarrative.ts";

const base = {
  toWhom: "Анна",
  reason: "опоздание",
  reflection: "слушать внимательнее",
};

describe("buildApologyNarrative", () => {
  it("i_said male: извинился, без скобок", () => {
    const s = buildApologyNarrative(
      { ...base, direction: "i_said" },
      "male",
    );
    expect(s).toContain("Я извинился перед");
    expect(s).not.toContain("извинилась");
    expect(s).not.toContain("(лась)");
    expect(s).toContain("Анна");
    expect(s).toContain("опоздание");
  });

  it("i_said female: извинилась", () => {
    const s = buildApologyNarrative(
      { ...base, direction: "i_said" },
      "female",
    );
    expect(s).toContain("Я извинилась перед");
    expect(s).not.toContain("извинился перед");
  });

  it("said_to_me: скобочная форма глагола, без попросили прощения", () => {
    const s = buildApologyNarrative(
      { ...base, direction: "said_to_me" },
      "male",
    );
    expect(s).toContain("У меня извинился(лась)");
    expect(s).not.toContain("попросили прощения");
    expect(s).toContain("Анна");
    expect(s).toContain("опоздание");
  });

  it("said_to_me female: глагол у третьего лица всё ещё скобочный", () => {
    const s = buildApologyNarrative(
      { ...base, direction: "said_to_me" },
      "female",
    );
    expect(s).toContain("извинился(лась)");
  });

  it("пустые поля дают многоточие как раньше", () => {
    const s = buildApologyNarrative(
      {
        direction: "i_said",
        toWhom: "",
        reason: "",
        reflection: "",
      },
      "male",
    );
    expect(s).toContain("…");
  });
});
```

Run: `npm run test`  
Expected: **FAIL** (нет второго аргумента или старая реализация).

- [ ] **Step 4: Реализовать `buildApologyNarrative(fields, speakerGender)`**

`src/utils/apologyNarrative.ts` — импорт `apologyVerbFromMe`, сигнатура:

```ts
import type { ApologyDirection } from "../types/apologyEntry.ts";
import type { SpeakerGender } from "../types/speakerGender.ts";
import { apologyVerbFromMe } from "./speakerCopy.ts";

type NarrativeFields = {
  direction: ApologyDirection;
  toWhom: string;
  reason: string;
  reflection: string;
};

function segment(s: string): string {
  const t = s.trim();
  return t || "…";
}

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
```

Run: `npm run test`  
Expected: **PASS**

- [ ] **Step 5: Commit**

```bash
git add src/types/speakerGender.ts src/utils/speakerCopy.ts src/utils/apologyNarrative.ts src/utils/apologyNarrative.test.ts
git commit -m "feat: speaker-aware apology narrative and copy helpers"
```

---

### Task 3: Zustand store и localStorage

**Files:**
- Create: `src/store/useSpeakerPrefsStore.ts`

- [ ] **Step 1: Реализовать store**

```ts
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
```

- [ ] **Step 2: Проверка типов и линт**

Run: `npm run lint` && `npm run build`  
Expected: без ошибок.

- [ ] **Step 3: Commit**

```bash
git add src/store/useSpeakerPrefsStore.ts
git commit -m "feat: persist speaker gender preference in localStorage"
```

---

### Task 4: SettingsModal и шапка App

**Files:**
- Create: `src/components/SettingsModal.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Компонент модалки**

`src/components/SettingsModal.tsx`:

```tsx
import { Modal, Radio, Space, Typography } from "antd";
import type { SpeakerGender } from "../types/speakerGender.ts";
import { useSpeakerPrefsStore } from "../store/useSpeakerPrefsStore.ts";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SettingsModal({ open, onClose }: Props) {
  const speakerGender = useSpeakerPrefsStore((s) => s.speakerGender);
  const setSpeakerGender = useSpeakerPrefsStore((s) => s.setSpeakerGender);

  return (
    <Modal
      title="Настройки"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={400}
    >
      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
        Как показывать формулировки о вас в дневнике (извинился или извинилась, подсказки в полях).
      </Typography.Paragraph>
      <Radio.Group
        value={speakerGender}
        onChange={(e) => setSpeakerGender(e.target.value as SpeakerGender)}
      >
        <Space orientation="vertical">
          <Radio value="male">Мужчина</Radio>
          <Radio value="female">Женщина</Radio>
        </Space>
      </Radio.Group>
    </Modal>
  );
}
```

- [ ] **Step 2: App — кнопка перед справкой**

В `src/App.tsx`:

- Импорт `SettingOutlined` из `@ant-design/icons`, `SettingsModal`, `useState` для `settingsOpen`.
- В `app-view-dock` **перед** существующей кнопкой справки добавить `Button` с `icon={<SettingOutlined />}`, `type="text"`, `aria-label="Настройки отображения формулировок"`, `title` при желании, `onClick` → открыть модалку.
- Рядом с `HelpModal` отрендерить `<SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />`.

- [ ] **Step 3: lint + build**

Run: `npm run lint` && `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/components/SettingsModal.tsx src/App.tsx
git commit -m "feat: settings modal and header gear icon before help"
```

---

### Task 5: ApologyForm — нарратив и плейсхолдеры

**Files:**
- Modify: `src/components/ApologyForm.tsx`

- [ ] **Step 1: Подключить store и хелперы**

- Импорт `useSpeakerPrefsStore`, `apologyVerbFromMe`, `reasonDidWrongPlaceholder`, `reflectionPlaceholder`.
- В теле компонента: `const speakerGender = useSpeakerPrefsStore((s) => s.speakerGender);`
- В ветке `i_said`: вместо статического ` извинился(лась) перед ` вывести пробел + `apologyVerbFromMe(speakerGender)` + ` перед ` (без лишних скобок).
- В ветке `said_to_me`: оставить текст ` извинился(лась) ` как сейчас.
- Плейсхолдеры: ветка `i_said` — `reasonDidWrongPlaceholder(speakerGender)`; обе ветки для рефлексии — `reflectionPlaceholder(speakerGender)`.

- [ ] **Step 2: aria-label кнопок направления (опционально)**

По желанию обновить концы фраз «извинился»/«извинилась» в `aria-label` для согласованности; не обязательно для закрытия спеки.

- [ ] **Step 3: lint + build + тесты**

Run: `npm run test` && `npm run lint` && `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/components/ApologyForm.tsx
git commit -m "feat: apology form copy follows speaker gender setting"
```

---

### Task 6: EntryList и вызовы нарратива

**Files:**
- Modify: `src/components/EntryList.tsx`

- [ ] **Step 1: Подписка и второй аргумент**

```tsx
import { useSpeakerPrefsStore } from "../store/useSpeakerPrefsStore.ts";
// внутри компонента:
const speakerGender = useSpeakerPrefsStore((s) => s.speakerGender);
// в рендере:
{buildApologyNarrative(item, speakerGender)}
```

- [ ] **Step 2: Поиск других вызовов**

Run: `rg "buildApologyNarrative" -n src`  
Expected: только `EntryList` и определение в `apologyNarrative.ts` (и тесты).

- [ ] **Step 3: Commit**

```bash
git add src/components/EntryList.tsx
git commit -m "feat: entry cards use speaker gender in narrative text"
```

---

### Task 7: HelpModal

**Files:**
- Modify: `src/components/HelpModal.tsx`

- [ ] **Step 1: Динамический пример и пояснение**

- Импорт `useSpeakerPrefsStore`, `helpExampleFromMePhrase`.
- Внутри компонента взять `speakerGender`.
- В абзаце «Как пользоваться»: заменить статичное упоминание на вариант с `helpExampleFromMePhrase(speakerGender)` и короткую фразу, что вариант **«У меня извинился(лась)…»** остаётся со скобками, потому что глагол относится к тому, кто извинялся перед вами. Либо одна нейтральная строка: «Формулировки про вас зависят от настроек (иконка шестерёнки в шапке).» плюс пример для текущего пола — оба подхода удовлетворяют спеке; предпочтительно **и** пояснение про настройки, **и** пример `helpExampleFromMePhrase`.

- [ ] **Step 2: lint + build**

- [ ] **Step 3: Commit**

```bash
git add src/components/HelpModal.tsx
git commit -m "docs(ui): help text reflects speaker gender setting"
```

---

### Task 8: Задача T12 и финальная проверка

**Files:**
- Modify: `tasks.json`

- [ ] **Step 1: Обновить T12**

`status`: `done`, `notes`: кратко — реализовано, ключ `sorry.speakerGender`, файлы store/modal/form/narrative/help.

- [ ] **Step 2: Полная верификация**

Run:

```bash
npm run test
npm run lint
npm run build
```

Expected: все команды exit 0.

- [ ] **Step 3: Ручная смока**

Дневник: сменить пол, проверить «Я» и «У меня», ленту, справку, перезагрузку страницы (значение сохраняется).

- [ ] **Step 4: Commit**

```bash
git add tasks.json
git commit -m "chore: mark T12 speaker gender settings done"
```

---

## Spec coverage (self-review)

| Требование спеки | Задача |
|------------------|--------|
| Иконка настроек перед справкой, Modal, М/Ж, default мужчина | Task 4 |
| `sorry.speakerGender`, не в экспорте записей | Task 3 |
| Ветка «Я»: глагол + плейсхолдеры автора | Task 2, 5 |
| Ветка «У меня»: извинился(лась), нейтральный повод, рефлексия от пола | Task 2, 5 |
| `buildApologyNarrative` + синхронизация с UI, убрать «попросили прощения» | Task 2 |
| EntryList / вызовы нарратива | Task 6 |
| HelpModal | Task 7 |
| Хелперы без дублирования | Task 2 |
| Юнит-тесты комбинаций | Task 2 |
| lint + build | все задачи |

Placeholder scan: нет TBD/TODO в шагах. Тип `SpeakerGender` согласован между файлами.

---

## Execution handoff

**План сохранён в `docs/superpowers/plans/2026-04-02-speaker-gender-settings.md`. Два варианта выполнения:**

**1. Subagent-Driven (рекомендуется)** — отдельный субагент на каждую задачу, ревью между задачами, быстрые итерации.

**2. Inline Execution** — выполнять шаги в этой сессии по чеклисту с контрольными точками.

**Какой вариант удобнее?**
