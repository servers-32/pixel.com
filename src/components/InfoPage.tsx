import styles from './InfoPage.module.css'
import { useI18n } from '../i18n'

export type InfoKind = 'about' | 'delivery' | 'contacts'

export function InfoPage({ kind }: { kind: InfoKind }) {
  const { locale } = useI18n()
  const PAGES = {
    about: {
      title: locale === 'en' ? 'About store' : locale === 'uk' ? 'Про магазин' : 'О магазине',
      body: (
        <>
          <p>
            {locale === 'en'
              ? 'PiXEL is an online store for electronics and accessories. We curate актуальные smartphones, laptops, tablets, audio devices, and gadgets from trusted brands, help with product selection, and deliver orders across Ukraine.'
              : locale === 'uk'
                ? 'PiXEL — інтернет-магазин електроніки та аксесуарів. Ми збираємо актуальні смартфони, ноутбуки, планшети, аудіотехніку та гаджети від перевірених брендів, допомагаємо з вибором і доставляємо замовлення по Україні.'
                : 'PiXEL — интернет-магазин электроники и аксессуаров. Мы собираем актуальные смартфоны, ноутбуки, планшеты, аудиотехнику и гаджеты от проверенных брендов, помогаем с выбором и доставляем заказы по Украине.'}
          </p>
          <p>
            {locale === 'en'
              ? 'The site includes a convenient catalog, cart, checkout flow, account area, and purchase history. Product photos and descriptions are based on official supplier materials; in case of differences, the invoice and packing list take priority.'
              : locale === 'uk'
                ? 'На сайті — зручний каталог, кошик, оформлення замовлення, особистий кабінет та історія покупок. Фотографії товарів і описи формуються на основі офіційних матеріалів постачальників; у разі розбіжностей орієнтуйтеся на комплектацію в рахунку та накладній.'
                : 'На сайте — удобный каталог, корзина, оформление заказа, личный кабинет и история покупок. Фотографии товаров и описания формируются на основе официальных материалов поставщиков; при расхождениях ориентируйтесь на комплектацию в счёте и накладной.'}
          </p>
        </>
      ),
    },
    delivery: {
      title: locale === 'en' ? 'Delivery and payment' : locale === 'uk' ? 'Доставка та оплата' : 'Доставка и оплата',
      body: (
        <>
          <p>
            <strong>{locale === 'en' ? 'Delivery.' : locale === 'uk' ? 'Доставка.' : 'Доставка.'}</strong>{' '}
            {locale === 'en'
              ? 'Across Ukraine: courier to the door, Nova Poshta pickup point or parcel locker, and other services by agreement. Timing and cost depend on the city and delivery option; exact figures are shown during checkout.'
              : locale === 'uk'
                ? 'По Україні: курʼєром до дверей, «Нова Пошта» (відділення або поштомат), інші служби — за погодженням. Термін і вартість залежать від міста та обраного способу; точні цифри видно під час оформлення замовлення.'
                : 'По Украине: курьером до двери, «Новая Почта» (отделение или почтомат), другие службы — по согласованию. Срок и стоимость зависят от города и выбранного способа; точные цифры видны при оформлении заказа.'}
          </p>
          <p>
            <strong>{locale === 'en' ? 'Payment.' : locale === 'uk' ? 'Оплата.' : 'Оплата.'}</strong>{' '}
            {locale === 'en'
              ? 'Online bank card (Visa, Mastercard), Apple Pay / Google Pay, and pay on delivery where available for the selected delivery method. After successful payment you will receive a confirmation by email.'
              : locale === 'uk'
                ? 'Банківська картка онлайн (Visa, Mastercard), Apple Pay / Google Pay, оплата при отриманні — де доступно для вашого способу доставки. Після успішної оплати ви отримаєте підтвердження на email.'
                : 'Банковская карта онлайн (Visa, Mastercard), Apple Pay / Google Pay, оплата при получении — где доступно для вашего способа доставки. После успешной оплаты вы получите подтверждение на email.'}
          </p>
        </>
      ),
    },
    contacts: {
      title: locale === 'en' ? 'Contacts' : locale === 'uk' ? 'Контакти' : 'Контакты',
      body: (
        <>
          <p>
            <strong>{locale === 'en' ? 'Phone:' : locale === 'uk' ? 'Телефон:' : 'Телефон:'}</strong>{' '}
            <a href="tel:+380800123456">0 800 123 456</a> ({locale === 'en' ? 'free across Ukraine' : locale === 'uk' ? 'безкоштовно по Україні' : 'бесплатно по Украине'})
          </p>
          <p>
            <strong>{locale === 'en' ? 'Local:' : locale === 'uk' ? 'Міський:' : 'Городской:'}</strong>{' '}
            <a href="tel:+380441234567">+38 (044) 123-45-67</a>
          </p>
          <p>
            <strong>Email:</strong> <a href="mailto:hello@electriccompany.ua">hello@electriccompany.ua</a>
          </p>
          <p>
            <strong>{locale === 'en' ? 'Showroom address:' : locale === 'uk' ? 'Адреса шоуруму:' : 'Адрес шоурума:'}</strong>{' '}
            {locale === 'en' ? 'Kyiv, Khreshchatyk St. 22, Globus Mall, 3rd floor.' : locale === 'uk' ? 'м. Київ, вул. Хрещатик, 22, ТЦ «Глобус», 3 поверх.' : 'г. Киев, ул. Хрещатик, 22, ТЦ «Глобус», 3 этаж.'}
          </p>
        </>
      ),
    },
  } as const
  const p = PAGES[kind]

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>{p.title}</h1>
      <div className={styles.prose}>{p.body}</div>
    </div>
  )
}
