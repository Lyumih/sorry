/** Имя базы IndexedDB для приложения «Прости, Извини». */
export const DB_NAME = "sorry-apology-diary";

/** Версия схемы: при изменении store — увеличить и описать миграцию в `onupgradeneeded`. */
export const DB_VERSION = 1;

/** Object store для сущности ApologyEntry (`keyPath: id`). */
export const STORE_ENTRIES = "entries";

/** Индекс по полю `createdAt` для сортировки и выборок по времени. */
export const INDEX_CREATED_AT = "idx_createdAt";
