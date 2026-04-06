import styles from './TrustSection.module.css'

const ITEMS = [
  {
    title: 'Гарантия',
    text: 'Техника с гарантией от магазина и производителя. Новые позиции с заводскими пломбами; перед выдачей можно проверить комплектацию и внешний вид вместе с менеджером.',
    icon: 'shield',
  },
  {
    title: 'Честные цены',
    text: 'Регулярные акции, прозрачные условия доставки и оплаты. Следим за рынком и предлагаем сбалансированные предложения по смартфонам, ноутбукам и аксессуарам.',
    icon: 'percent',
  },
  {
    title: 'Доставка по Украине',
    text: 'Курьером до двери или в пункт выдачи — сроки зависят от города и наличия. Отслеживание отправления и связь с поддержкой на этапах оформления.',
    icon: 'truck',
  },
  {
    title: 'Актуальный каталог',
    text: 'Подборки хитов и новинок, фильтры по бренду и цене. Менеджеры помогут сравнить модели и подобрать аксессуары к заказу.',
    icon: 'phone',
  },
] as const

function Icon({ name }: { name: (typeof ITEMS)[number]['icon'] }) {
  if (name === 'shield') {
    return (
      <svg className={styles.ico} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V7l7-4z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (name === 'percent') {
    return (
      <svg className={styles.ico} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6 18L18 6M8.5 8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm7 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (name === 'truck') {
    return (
      <svg className={styles.ico} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 7h11v10H3V7zm11 3h3l3 3v4h-6M7 19a2 2 0 104 0M17 19a2 2 0 104 0"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="6" y="3" width="12" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 7h6M9 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function TrustSection() {
  return (
    <section className={styles.section} aria-labelledby="trust-heading">
      <div className={styles.inner}>
        <h2 id="trust-heading" className={styles.heading}>
          Почему покупают у нас?
        </h2>
        <ul className={styles.grid}>
          {ITEMS.map((item) => (
            <li key={item.title} className={styles.item}>
              <div className={styles.iconWrap}>
                <Icon name={item.icon} />
              </div>
              <div>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.text}>{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
