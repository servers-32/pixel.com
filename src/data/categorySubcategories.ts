/** Подкатегории для сайдбара главной: подпись + строка поиска в каталоге */
export type CategorySub = { label: string; query: string }

export const CATEGORY_SUBCATEGORIES: Record<string, CategorySub[]> = {
  Смартфоны: [
    { label: 'Apple', query: 'Apple' },
    { label: 'Samsung', query: 'Samsung' },
    { label: 'Флагманы', query: 'Pro' },
    { label: 'Бюджетные модели', query: 'Lite' },
  ],
  Ноутбуки: [
    { label: 'Ультрабуки', query: 'Ultra' },
    { label: 'Игровые', query: 'игр' },
    { label: 'OLED-экран', query: 'OLED' },
  ],
  Аудио: [
    { label: 'Наушники', query: 'наушник' },
    { label: 'Колонки', query: 'колонк' },
    { label: 'TWS', query: 'AirPods' },
  ],
  'Телевизоры': [
    { label: 'OLED и QLED', query: 'OLED' },
    { label: 'Большие экраны', query: '65' },
    { label: 'LG', query: 'LG' },
  ],
  Планшеты: [
    { label: 'Со стилусом', query: 'стилус' },
    { label: 'Surface / Windows', query: 'Surface' },
    { label: 'Компактные', query: '8"' },
  ],
  'Игры и консоли': [
    { label: 'PlayStation', query: 'PlayStation' },
    { label: 'Nintendo Switch', query: 'Switch' },
    { label: 'Аксессуары для игр', query: 'Sony' },
  ],
  'Техника для дома': [
    { label: 'Роботы-пылесосы', query: 'робот' },
    { label: 'Вертикальные пылесосы', query: 'Dyson' },
    { label: 'Умный дом', query: 'Xiaomi' },
  ],
  'Фото и видео': [
    { label: 'Беззеркальные камеры', query: 'Canon' },
    { label: 'Экшн-камеры', query: 'GoPro' },
    { label: 'Стабилизация', query: 'HyperSmooth' },
  ],
  Аксессуары: [
    { label: 'Клавиатуры', query: 'клавиатур' },
    { label: 'Мыши', query: 'мыш' },
  ],
}
