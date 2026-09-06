// ============================================================
// Все настройки проекта собраны в одном месте.
// ============================================================

export const CONFIG = {
  // URL Web App из Apps Script (файл Code.gs), отдающий JSON книги рецептов.
  // Пример: 'https://script.google.com/macros/s/AKfycb.../exec'
  CATALOG_API_URL: 'ВСТАВЬТЕ_СЮДА_URL_ВАШЕГО_APPS_SCRIPT_WEB_APP',

  // Сколько миллисекунд хранить книгу рецептов в кэше браузера
  // (localStorage), чтобы не дёргать Apps Script при каждом открытии.
  CATALOG_CACHE_TTL_MS: 10 * 60 * 1000, // 10 минут

  // Название приложения, показывается в шапке.
  APP_TITLE: 'Кулинарная книга',

  STORAGE_KEYS: {
    CATALOG_CACHE: 'cookbook_catalog_cache_v1',
  },
};
