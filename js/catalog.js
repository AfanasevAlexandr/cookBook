/**
 * Фильтрует рецепты по выбранной категории и по строке поиска
 * (по названию блюда).
 */
export function filterRecipes(recipes, { selectedCategoryId, searchQuery }) {
  let result = recipes;

  if (selectedCategoryId) {
    result = result.filter(r => r.category_id === selectedCategoryId);
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    result = result.filter(r => r.name.toLowerCase().includes(q));
  }

  return result;
}

/** Рендерит ряд чипов-категорий ("Все" + по одной на каждую категорию). */
export function renderCategoryChips(container, categories, selectedId, onSelect) {
  container.innerHTML = '';

  const allChip = document.createElement('button');
  allChip.type = 'button';
  allChip.className = 'chip' + (selectedId === null ? ' is-active' : '');
  allChip.textContent = 'Все';
  allChip.addEventListener('click', () => onSelect(null));
  container.appendChild(allChip);

  categories.forEach(cat => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (selectedId === cat.id ? ' is-active' : '');
    chip.textContent = cat.name;
    chip.addEventListener('click', () => onSelect(cat.id));
    container.appendChild(chip);
  });
}

/** Создаёт строку списка рецептов (без изображений). */
export function createRecipeRow(recipe) {
  const row = document.createElement('article');
  row.className = 'recipe-item';
  row.dataset.id = recipe.id;

  const body = document.createElement('div');
  body.className = 'recipe-item__body';

  const name = document.createElement('div');
  name.className = 'recipe-item__name';
  name.textContent = recipe.name;
  body.appendChild(name);

  const ingredientCount = parseIngredients(recipe.ingredients).length;
  if (ingredientCount > 0) {
    const meta = document.createElement('div');
    meta.className = 'recipe-item__meta';
    meta.textContent = pluralizeIngredients(ingredientCount);
    body.appendChild(meta);
  }

  const arrow = document.createElement('span');
  arrow.className = 'recipe-item__arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '›';

  row.append(body, arrow);
  return row;
}

function pluralizeIngredients(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  let word = 'ингредиентов';
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 === 1) word = 'ингредиент';
    else if (mod10 >= 2 && mod10 <= 4) word = 'ингредиента';
  }
  return `${n} ${word}`;
}

/**
 * Разбивает строку ингредиентов (разделённых ";") на массив
 * отдельных пунктов, убирая переносы строк внутри исходной ячейки.
 */
export function parseIngredients(raw) {
  return String(raw || '')
    .split(';')
    .map(s => s.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}

/**
 * Разбивает строку способа приготовления на отдельные шаги
 * (по переносам строк) и убирает ведущую нумерацию вида "1. ",
 * так как шаги нумеруются заново в интерфейсе.
 */
export function parseSteps(raw) {
  return String(raw || '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.replace(/^\d+[.)]\s*/, ''));
}
