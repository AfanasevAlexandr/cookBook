// ============================================================
// Все настройки проекта собраны в одном месте.
// ============================================================

export const CONFIG = {
  // URL Web App из Apps Script (файл Code.gs), отдающий JSON книги рецептов.
  // Пример: 'https://script.google.com/macros/s/AKfycb.../exec'
  CATALOG_API_URL: 'https://script.google.com/macros/s/AKfycbyUEouphkK9ER7atGvUmPoK0e5AtoHZ1Vgzg-8mL08HSsQu7Z_YVyTJOqeZXOLoF9sS/exec',

  // Сколько миллисекунд хранить книгу рецептов в кэше браузера
  // (localStorage), чтобы не дёргать Apps Script при каждом открытии.
  CATALOG_CACHE_TTL_MS: 5 * 60 * 1000, // 5 минут

  // Название приложения, показывается в шапке.
  APP_TITLE: 'Кулинарная книга',

  STORAGE_KEYS: {
    CATALOG_CACHE: 'cookbook_catalog_cache_v1',
  },
};
