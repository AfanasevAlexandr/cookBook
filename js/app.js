import { CONFIG } from './config.js';
import { fetchCatalog } from './api.js';
import {
  filterRecipes,
  renderCategoryChips,
  createRecipeRow,
  parseIngredients,
  parseSteps,
} from './catalog.js';

/**
 * Рендерит один пункт списка ингредиентов: подзаголовок группы
 * (напр. "Для теста") — без маркера, обычный пункт — с маркером.
 */
function createIngredientListItem(entry) {
  const li = document.createElement('li');
  if (entry.type === 'heading') {
    li.className = 'ingredient-list__heading';
  } else {
    li.className = 'ingredient-list__item';
  }
  li.textContent = entry.text;
  return li;
}

// ---- Глобальное состояние приложения ----
const state = {
  categories: [],
  recipes: [],
  selectedCategoryId: null, // null = "Все"
  searchQuery: '',
};

// ---- DOM-элементы ----
const el = {
  appTitle: document.getElementById('app-title'),
  searchInput: document.getElementById('search-input'),
  categoriesRow: document.getElementById('categories-row'),
  loadingState: document.getElementById('loading-state'),
  errorState: document.getElementById('error-state'),
  emptyState: document.getElementById('empty-state'),
  retryBtn: document.getElementById('retry-btn'),
  recipeList: document.getElementById('recipe-list'),

  recipeOverlay: document.getElementById('recipe-overlay'),
  recipeClose: document.getElementById('recipe-close'),
  recipeDetail: document.getElementById('recipe-detail'),
};

const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;

// ============================================================
// ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP
// ============================================================
function initTelegram() {
  if (!tg) return;

  tg.ready();
  tg.expand();

  applyThemeParams();
  tg.onEvent('themeChanged', applyThemeParams);

  if (tg.MainButton) {
    tg.MainButton.hide();
  }
}

function applyThemeParams() {
  if (!tg || !tg.themeParams) return;
  const p = tg.themeParams;
  const root = document.documentElement.style;

  if (p.bg_color) root.setProperty('--tg-bg-color', p.bg_color);
  if (p.secondary_bg_color) root.setProperty('--tg-secondary-bg-color', p.secondary_bg_color);
  if (p.text_color) root.setProperty('--tg-text-color', p.text_color);
  if (p.hint_color) root.setProperty('--tg-hint-color', p.hint_color);
  if (p.link_color) root.setProperty('--tg-link-color', p.link_color);
  if (p.button_color) root.setProperty('--tg-button-color', p.button_color);
  if (p.button_text_color) root.setProperty('--tg-button-text-color', p.button_text_color);
}

// ============================================================
// ЗАГРУЗКА КНИГИ РЕЦЕПТОВ
// ============================================================
async function loadCatalog() {
  setViewState('loading');
  try {
    const data = await fetchCatalog();
    state.categories = data.categories || [];
    state.recipes = data.recipes || [];

    if (CONFIG.APP_TITLE) el.appTitle.textContent = CONFIG.APP_TITLE;

    setViewState('ready');
    renderCategories();
    renderRecipes();
  } catch (err) {
    console.error(err);
    setViewState('error');
  }
}

function setViewState(view) {
  el.loadingState.hidden = view !== 'loading';
  el.errorState.hidden = view !== 'error';
  el.recipeList.hidden = view !== 'ready';
}

// ============================================================
// РЕНДЕР КАТЕГОРИЙ
// ============================================================
function renderCategories() {
  renderCategoryChips(el.categoriesRow, state.categories, state.selectedCategoryId, onSelectCategory);
}

function onSelectCategory(categoryId) {
  state.selectedCategoryId = categoryId;
  renderCategories();
  renderRecipes();
}

// ============================================================
// РЕНДЕР СПИСКА РЕЦЕПТОВ
// ============================================================
function renderRecipes() {
  const list = filterRecipes(state.recipes, {
    selectedCategoryId: state.selectedCategoryId,
    searchQuery: state.searchQuery,
  });

  el.recipeList.innerHTML = '';
  el.emptyState.hidden = list.length !== 0;
  el.recipeList.hidden = list.length === 0;

  list.forEach(recipe => {
    const row = createRecipeRow(recipe);
    el.recipeList.appendChild(row);
  });
}

el.recipeList.addEventListener('click', e => {
  const row = e.target.closest('.recipe-item');
  if (!row) return;
  openRecipeDetail(row.dataset.id);
});

// ============================================================
// ДЕТАЛЬНАЯ КАРТОЧКА РЕЦЕПТА
// ============================================================
function openRecipeDetail(id) {
  const recipe = state.recipes.find(r => r.id === id);
  if (!recipe) return;

  el.recipeDetail.innerHTML = '';

  const name = document.createElement('h2');
  name.className = 'recipe-detail__name';
  name.textContent = recipe.name;
  el.recipeDetail.appendChild(name);

  const ingredients = parseIngredients(recipe.ingredients);
  if (ingredients.length > 0) {
    const section = document.createElement('section');
    section.className = 'recipe-section';

    const heading = document.createElement('h3');
    heading.className = 'recipe-section__heading';
    heading.textContent = 'Ингредиенты';
    section.appendChild(heading);

    const list = document.createElement('ul');
    list.className = 'ingredient-list';
    ingredients.forEach(entry => {
      list.appendChild(createIngredientListItem(entry));
    });
    section.appendChild(list);
    el.recipeDetail.appendChild(section);
  }

  const steps = parseSteps(recipe.instructions);
  if (steps.length > 0) {
    const section = document.createElement('section');
    section.className = 'recipe-section';

    const heading = document.createElement('h3');
    heading.className = 'recipe-section__heading';
    heading.textContent = 'Способ приготовления';
    section.appendChild(heading);

    const list = document.createElement('ol');
    list.className = 'step-list';
    steps.forEach(step => {
      const li = document.createElement('li');
      li.className = 'step-list__item';
      li.textContent = step;
      list.appendChild(li);
    });
    section.appendChild(list);
    el.recipeDetail.appendChild(section);
  }

  if (recipe.notes) {
    const note = document.createElement('p');
    note.className = 'recipe-note';
    note.textContent = recipe.notes;
    el.recipeDetail.appendChild(note);
  }

  openOverlay(el.recipeOverlay);
  el.recipeDetail.scrollTop = 0;
}

el.recipeClose.addEventListener('click', () => closeOverlay(el.recipeOverlay));

// ============================================================
// ПОИСК
// ============================================================
let searchDebounceTimer = null;
el.searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    state.searchQuery = el.searchInput.value;
    renderRecipes();
  }, 200);
});

// ============================================================
// ПРОЧЕЕ
// ============================================================
el.retryBtn.addEventListener('click', loadCatalog);

function openOverlay(overlay) {
  overlay.hidden = false;
}
function closeOverlay(overlay) {
  overlay.hidden = true;
}

el.recipeOverlay.addEventListener('click', e => {
  if (e.target === el.recipeOverlay) closeOverlay(el.recipeOverlay);
});

// ============================================================
// СТАРТ ПРИЛОЖЕНИЯ
// ============================================================
async function bootstrap() {
  initTelegram();
  await loadCatalog();
}

bootstrap();
