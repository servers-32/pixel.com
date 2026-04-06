import type { ProductReview } from '../types'
import type { Locale } from '../i18n'

function hash(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

const AUTHORS: Record<Locale, string[]> = {
  ru: ['Алексей К.', 'Мария С.', 'Дмитрий В.', 'Елена П.', 'Игорь Н.', 'Анна Л.', 'Сергей Т.', 'Ольга М.', 'Павел Р.', 'Наталья Ж.', 'Константин Б.', 'Юлия Ф.'],
  uk: ['Олексій К.', 'Марія С.', 'Дмитро В.', 'Олена П.', 'Ігор Н.', 'Анна Л.', 'Сергій Т.', 'Ольга М.', 'Павло Р.', 'Наталія Ж.', 'Костянтин Б.', 'Юлія Ф.'],
  en: ['Alex K.', 'Maria S.', 'Dmytro V.', 'Olena P.', 'Igor N.', 'Anna L.', 'Serhii T.', 'Olga M.', 'Pavlo R.', 'Natalia Zh.', 'Kostiantyn B.', 'Yulia F.'],
}

type Snip = { title: string; text: string; baseRating: number }

const SNIPS: Record<Locale, Snip[]> = {
  ru: [
    { baseRating: 5, title: 'Рекомендую', text: 'Долго сравнивал с аналогами, остановился на этом варианте. Качество сборки приятно удивило, всё работает стабильно.' },
    { baseRating: 5, title: 'Отличная покупка', text: 'Доставили за пару дней, упаковка целая. В комплекте всё заявленное — проверил сразу после получения.' },
    { baseRating: 5, title: 'Соответствует ожиданиям', text: 'Для повседневных задач самое то. Нагрузку держит уверенно, шум минимальный, нагрев в норме.' },
    { baseRating: 4, title: 'Хорошо, есть нюансы', text: 'В целом доволен ценой и качеством. Единственный минус — хотелось бы чуть удобнее комплектацию в коробке.' },
    { baseRating: 4, title: 'Норм за эти деньги', text: 'Беру не первый раз технику в этом сегменте — здесь баланс цена/возможности очень разумный.' },
    { baseRating: 4, title: 'Почти идеал', text: 'Пользуюсь около месяца. Замечаний по работе нет, косметически мелочь на корпусе заметил только при ярком свете.' },
    { baseRating: 3, title: 'Средне', text: 'Ожидал чуть большего по автономности/яркости, но для офиса и дома хватает. Возможно, переплатил за бренд.' },
    { baseRating: 5, title: 'Подарок удался', text: 'Покупали в подарок — человек доволен, сам бы тоже взял. Магазин отработал чётко, курьер позвонил заранее.' },
    { baseRating: 4, title: 'Доставка и сервис', text: 'С товаром всё ок, отдельно отмечу вежливую поддержку: помогли с выбором аксессуара по телефону.' },
    { baseRating: 5, title: 'Беру второй раз', text: 'Первый экземпляр отдал родителям — понравился настолько, что заказал себе такой же.' },
  ],
  uk: [
    { baseRating: 5, title: 'Рекомендую', text: 'Довго порівнював з аналогами й зупинився на цій моделі. Якість збірки приємно здивувала, усе працює стабільно.' },
    { baseRating: 5, title: 'Чудова покупка', text: 'Доставили за кілька днів, упаковка ціла. У комплекті все заявлене — перевірив одразу після отримання.' },
    { baseRating: 5, title: 'Відповідає очікуванням', text: 'Для щоденних задач саме те. Навантаження тримає впевнено, шум мінімальний, нагрів у нормі.' },
    { baseRating: 4, title: 'Добре, але є нюанси', text: 'Загалом задоволений ціною та якістю. Єдиний мінус — хотілося б трохи зручнішу комплектацію в коробці.' },
    { baseRating: 4, title: 'Нормально за ці гроші', text: 'Беру техніку в цьому сегменті не вперше — тут дуже розумний баланс ціни та можливостей.' },
    { baseRating: 4, title: 'Майже ідеал', text: 'Користуюся близько місяця. Зауважень до роботи немає, дрібницю на корпусі помітив лише при яскравому світлі.' },
    { baseRating: 3, title: 'Посередньо', text: 'Очікував трохи більшої автономності та яскравості, але для офісу й дому вистачає. Можливо, переплатив за бренд.' },
    { baseRating: 5, title: 'Подарунок вдався', text: 'Купували на подарунок — людина задоволена, сам би теж узяв. Магазин відпрацював чітко, курʼєр подзвонив завчасно.' },
    { baseRating: 4, title: 'Доставка і сервіс', text: 'З товаром усе добре, окремо відзначу ввічливу підтримку: допомогли підібрати аксесуар телефоном.' },
    { baseRating: 5, title: 'Беру вдруге', text: 'Перший екземпляр віддав батькам — сподобався настільки, що замовив собі такий самий.' },
  ],
  en: [
    { baseRating: 5, title: 'Recommended', text: 'I compared this model with similar options for a long time and finally chose it. Build quality was a pleasant surprise and everything works reliably.' },
    { baseRating: 5, title: 'Great purchase', text: 'Delivery took only a couple of days and the box arrived intact. Everything listed in the package was there right after unboxing.' },
    { baseRating: 5, title: 'Meets expectations', text: 'A very good fit for everyday use. It handles workload confidently, noise is minimal, and temperatures stay within reason.' },
    { baseRating: 4, title: 'Good with minor caveats', text: 'Overall I am happy with the price-to-quality ratio. The only downside is that the package contents could have been arranged a bit more conveniently.' },
    { baseRating: 4, title: 'Worth the money', text: 'This is not my first purchase in this segment, and here the balance between price and capabilities feels very sensible.' },
    { baseRating: 4, title: 'Almost perfect', text: 'I have been using it for about a month. No operational issues so far; I only noticed a tiny cosmetic detail under bright light.' },
    { baseRating: 3, title: 'Average', text: 'I expected a bit more battery life and brightness, but it is still enough for office work and home use. I may have paid extra for the brand.' },
    { baseRating: 5, title: 'Great gift', text: 'We bought it as a gift and the recipient is happy. I would gladly buy the same one for myself too. The store handled everything smoothly.' },
    { baseRating: 4, title: 'Delivery and service', text: 'The product itself is fine, and I also want to mention the polite support team: they helped me choose the right accessory over the phone.' },
    { baseRating: 5, title: 'Bought it again', text: 'I gave the first unit to my parents and liked it so much that I ordered the same one for myself.' },
  ],
}

function clampRating(n: number): number {
  return Math.min(5, Math.max(1, Math.round(n)))
}

/**
 * Детерминированный набор отзывов для карточки товара.
 * Средняя оценка в выборке близка к `productRating`.
 */
export function getReviewsForProduct(productId: string, productRating: number, locale: Locale = 'ru'): ProductReview[] {
  const h = hash(productId)
  const count = 5 + (h % 4)
  const target = productRating
  const reviews: ProductReview[] = []
  const authors = AUTHORS[locale]
  const snips = SNIPS[locale]

  for (let i = 0; i < count; i++) {
    const sn = snips[(h + i * 13) % snips.length]
    let rating = sn.baseRating
    if (i >= count - 3) {
      const drift = ((h >> (i % 4)) & 3) - 1
      rating = clampRating(target + drift * 0.5 + (i % 2 === 0 ? 0 : -0.3))
    } else {
      rating = clampRating(sn.baseRating + (((h + i) % 5) - 2) * 0.25)
    }
    const author = authors[(h + i * 7) % authors.length]
    const days = 3 + ((h + i * 11) % 120) + i * 9
    const text =
      i % 3 === 0
        ? locale === 'en'
          ? `${sn.text} The listing on the site matches the product very closely.`
          : locale === 'uk'
            ? `${sn.text} Опис на сайті повністю відповідає товару.`
            : `${sn.text} Совпадение с описанием на сайте — полное.`
        : sn.text

    reviews.push({
      id: `${productId}-rev-${i}`,
      authorName: author,
      rating,
      date: isoDaysAgo(days),
      title: sn.title,
      text,
      verifiedPurchase: ((h + i) % 7) !== 0,
    })
  }

  return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function averageReviewRating(reviews: ProductReview[]): number {
  if (reviews.length === 0) return 0
  const s = reviews.reduce((acc, r) => acc + r.rating, 0)
  return s / reviews.length
}

export function reviewStarHistogram(reviews: ProductReview[]): Record<1 | 2 | 3 | 4 | 5, number> {
  const hist: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const r of reviews) {
    const k = clampRating(r.rating) as 1 | 2 | 3 | 4 | 5
    hist[k] += 1
  }
  return hist
}
