import ruRUImport from "antd/locale/ru_RU";

/** Подписи дней недели с понедельника (в antd ru_RU по умолчанию — с воскресенья). */
const shortWeekDaysMondayFirst = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

type AntdRu = typeof ruRUImport;

/**
 * В части окружений (interop CJS/ESM) default-экспорт приходит как `{ default: локаль }`.
 */
function unwrapAntdLocaleRu(raw: AntdRu | { default: AntdRu }): AntdRu {
  if (raw && typeof raw === "object" && "DatePicker" in raw && raw.DatePicker) {
    return raw as AntdRu;
  }
  const inner = (raw as { default?: AntdRu }).default;
  if (inner && typeof inner === "object" && inner.DatePicker) {
    return inner;
  }
  return raw as AntdRu;
}

const ruRU = unwrapAntdLocaleRu(ruRUImport as AntdRu | { default: AntdRu });

/**
 * Русская локаль Ant Design: календарь с понедельника, тексты на русском.
 */
const dp = ruRU.DatePicker;
const cal = ruRU.Calendar;

if (!dp?.lang || !cal?.lang) {
  throw new Error("antd/locale/ru_RU: ожидались DatePicker.lang и Calendar.lang");
}

export const appRuLocale = {
  ...ruRU,
  DatePicker: {
    ...dp,
    lang: {
      ...dp.lang,
      shortWeekDays: shortWeekDaysMondayFirst,
    },
  },
  Calendar: {
    ...cal,
    lang: {
      ...cal.lang,
      shortWeekDays: shortWeekDaysMondayFirst,
    },
  },
} as AntdRu;
