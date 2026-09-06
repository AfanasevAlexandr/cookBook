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

  const ingredientCount = countIngredients(parseIngredients(recipe.ingredients));
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
 * Разбивает ячейку с ингредиентами на массив отдельных пунктов.
 *
 * В таблице встречаются два формата записи (иногда даже в одной
 * ячейке): пункты через ";" и/или пункты каждый на новой строке.
 * Поэтому сначала делим по переносам строк, а затем каждую строку
 * ещё и по ";" — так пункты не склеиваются, каким бы разделителем
 * их ни записали.
 *
 * Строки вида "Для теста:" (заканчиваются двоеточием) распознаются
 * как подзаголовок группы, а не как ингредиент, и возвращаются
 * отдельным типом записи для отображения без маркера-точки.
 *
 * Возвращает массив { type: 'item' | 'heading', text }.
 */
export function parseIngredients(raw) {
  const lines = String(raw || '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const entries = [];
  lines.forEach(line => {
    if (/:\s*$/.test(line)) {
      entries.push({ type: 'heading', text: line.replace(/:\s*$/, '') });
      return;
    }
    line
      .split(';')
      .map(s => s.trim())
      .filter(Boolean)
      .forEach(text => entries.push({ type: 'item', text }));
  });

  return entries;
}

/** Считает только реальные пункты ингредиентов, без подзаголовков групп. */
export function countIngredients(entries) {
  return entries.filter(e => e.type === 'item').length;
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
