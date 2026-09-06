import { CONFIG } from './config.js';

/**
 * Загружает книгу рецептов (категории + рецепты) из Apps Script.
 * Использует кэш в localStorage, чтобы не дёргать API при каждом
 * открытии приложения — актуальность обновляется с задержкой
 * до CATALOG_CACHE_TTL_MS (см. config.js).
 *
 * @param {boolean} forceRefresh - игнорировать кэш и загрузить заново
 */
export async function fetchCatalog(forceRefresh = false) {
  const cacheKey = CONFIG.STORAGE_KEYS.CATALOG_CACHE;

  if (!forceRefresh) {
    const cached = readCache(cacheKey);
    if (cached) return cached;
  }

  if (!CONFIG.CATALOG_API_URL || CONFIG.CATALOG_API_URL.startsWith('ВСТАВЬТЕ')) {
    throw new Error(
      'CATALOG_API_URL не настроен в js/config.js — вставьте туда URL вашего Apps Script Web App.'
    );
  }

  const res = await fetch(CONFIG.CATALOG_API_URL, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`Ошибка загрузки книги рецептов: HTTP ${res.status}`);
  }

  const data = await res.json();
  writeCache(cacheKey, data);
  return data;
}

function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.savedAt) return null;

    const age = Date.now() - parsed.savedAt;
    if (age > CONFIG.CATALOG_CACHE_TTL_MS) return null;

    return parsed.data;
  } catch (err) {
    return null;
  }
}

function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
  } catch (err) {
    // localStorage может быть недоступен/переполнен — не критично, просто без кэша
  }
}
