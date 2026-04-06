import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from './BrandLogo'
import { TrustSection } from './TrustSection'
import styles from './Footer.module.css'
import { useShop } from '../context/useShop'
import { useI18n } from '../i18n'
import { localizeCategory } from '../i18n/catalog'

const year = new Date().getFullYear()

export function Footer() {
  const { locale } = useI18n()
  const { pushToast, setCategoryFilter, setBrandFilter } = useShop()
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)

  const t =
    locale === 'en'
      ? {
          consentRequired: 'Consent to personal data processing is required',
          subscribed: 'Thanks for subscribing! Please check your email for the confirmation message.',
          newsletterTitle: 'Stay first to know everything!',
          newsletterSub: 'Subscribe to the newsletter and be the first to hear about new arrivals and PiXEL promotions.',
          emailPlaceholder: 'Your email',
          emailAria: 'Email for newsletter',
          subscribe: 'Subscribe',
          consent: 'I confirm my consent to the processing of personal data',
          catalog: 'Catalog',
          fullCatalog: 'Full catalog',
          customers: 'For customers',
          deliveryPayment: 'Delivery and payment',
          warranty: 'Warranty and returns',
          contacts: 'Contacts',
          orders: 'My orders',
          offer: 'Public offer',
          actual: 'Highlights',
          newItems: 'New arrivals',
          bestsellers: 'Best sellers',
          connection: 'Contact',
          chats: 'Chat support',
          tgChannel: 'Follow our Telegram channel →',
          address: 'Address',
          addressText: 'Kyiv, Khreshchatyk St. 22, Globus Mall, 3rd floor',
          hours: 'Mon-Fri 10:00-20:00 · Sat-Sun 10:00-19:00',
          rights: `© PiXEL, ${year}. All rights reserved.`,
          siteMap: 'Sitemap',
          privacy: 'Privacy policy',
          admin: 'Admin',
        }
      : locale === 'uk'
        ? {
            consentRequired: 'Потрібна згода на обробку даних',
            subscribed: 'Дякуємо за підписку! Перевірте пошту — скоро надішлемо лист із підтвердженням.',
            newsletterTitle: 'Дізнавайтеся про все першими!',
            newsletterSub: 'Підписавшись на розсилку, ви будете першими дізнаватися про новинки та акції магазину PiXEL.',
            emailPlaceholder: 'Ваш e-mail',
            emailAria: 'Email для розсилки',
            subscribe: 'Підписатися',
            consent: 'Я підтверджую згоду на обробку персональних даних',
            catalog: 'Каталог',
            fullCatalog: 'Увесь каталог',
            customers: 'Покупцям',
            deliveryPayment: 'Доставка та оплата',
            warranty: 'Гарантія та повернення',
            contacts: 'Контакти',
            orders: 'Мої замовлення',
            offer: 'Договір оферти',
            actual: 'Актуальне',
            newItems: 'Новинки',
            bestsellers: 'Хіти продажів',
            connection: "Зв'язок",
            chats: "Чати для зв'язку",
            tgChannel: 'Підписуйтеся на наш Telegram-канал →',
            address: 'Адреса',
            addressText: 'м. Київ, вул. Хрещатик, 22, ТЦ «Глобус», 3 поверх',
            hours: 'пн–пт 10:00–20:00 · сб–нд 10:00–19:00',
            rights: `© PiXEL, ${year}. Усі права захищені.`,
            siteMap: 'Мапа сайту',
            privacy: 'Політика конфіденційності',
            admin: 'Адмінка',
          }
        : {
            consentRequired: 'Нужно согласие на обработку данных',
            subscribed: 'Спасибо за подписку! Проверьте почту — скоро пришлём письмо с подтверждением.',
            newsletterTitle: 'Узнавайте обо всём первыми!',
            newsletterSub: 'Подписавшись на рассылку, вы будете первыми узнавать о новинках и акциях магазина PiXEL.',
            emailPlaceholder: 'Ваш e-mail',
            emailAria: 'Email для рассылки',
            subscribe: 'Подписаться',
            consent: 'Я подтверждаю согласие на обработку персональных данных',
            catalog: 'Каталог',
            fullCatalog: 'Весь каталог',
            customers: 'Покупателям',
            deliveryPayment: 'Доставка и оплата',
            warranty: 'Гарантия и возврат',
            contacts: 'Контакты',
            orders: 'Мои заказы',
            offer: 'Договор оферты',
            actual: 'Актуальное',
            newItems: 'Новинки',
            bestsellers: 'Хиты продаж',
            connection: 'Связь',
            chats: 'Чаты для связи',
            tgChannel: 'Подписывайтесь на наш Telegram-канал →',
            address: 'Адрес',
            addressText: 'г. Киев, ул. Хрещатик, 22, ТЦ «Глобус», 3 этаж',
            hours: 'пн–пт 10:00–20:00 · сб–вс 10:00–19:00',
            rights: `© PiXEL, ${year}. Все права защищены.`,
            siteMap: 'Карта сайта',
            privacy: 'Политика конфиденциальности',
            admin: 'Админка',
          }

  function onNewsletter(e: FormEvent) {
    e.preventDefault()
    if (!consent) {
      pushToast(t.consentRequired, 'error')
      return
    }
    pushToast(t.subscribed, 'success')
    setEmail('')
  }

  return (
    <div className={styles.footerWrap}>
      <TrustSection />

      <footer className={styles.footer}>
        <section className={styles.newsletter} aria-labelledby="nl-heading">
          <div className={styles.nlInner}>
            <div className={styles.nlCopy}>
              <h2 id="nl-heading" className={styles.nlTitle}>
                {t.newsletterTitle}
              </h2>
              <p className={styles.nlSub}>
                {t.newsletterSub}
              </p>
            </div>
            <form className={styles.nlForm} onSubmit={onNewsletter}>
              <div className={styles.nlRow}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className={styles.nlInput}
                  aria-label={t.emailAria}
                />
                <button type="submit" className={styles.nlSubmit} aria-label={t.subscribe}>
                  <svg viewBox="0 0 24 24" fill="none" className={styles.nlSubmitIco} aria-hidden>
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <label className={styles.nlCheck}>
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>{t.consent}</span>
              </label>
            </form>
          </div>
        </section>

        <div className={styles.main}>
          <div className={styles.col}>
            <h3 className={styles.heading}>
              <Link
                to="/catalog"
                className={styles.headingLink}
                onClick={() => {
                  setBrandFilter('all')
                  setCategoryFilter('all')
                }}
              >
                {t.catalog}
              </Link>
            </h3>
            <ul className={styles.links}>
              <li>
                <Link
                  to="/catalog"
                  onClick={() => {
                    setBrandFilter('all')
                    setCategoryFilter('Смартфоны')
                  }}
                >
                  {localizeCategory('Смартфоны', locale)}
                </Link>
              </li>
              <li>
                <Link
                  to="/catalog"
                  onClick={() => {
                    setBrandFilter('all')
                    setCategoryFilter('Ноутбуки')
                  }}
                >
                  {localizeCategory('Ноутбуки', locale)}
                </Link>
              </li>
              <li>
                <Link
                  to="/catalog"
                  onClick={() => {
                    setBrandFilter('all')
                    setCategoryFilter('Планшеты')
                  }}
                >
                  {localizeCategory('Планшеты', locale)}
                </Link>
              </li>
              <li>
                <Link
                  to="/catalog"
                  onClick={() => {
                    setBrandFilter('all')
                    setCategoryFilter('Аудио')
                  }}
                >
                  {localizeCategory('Аудио', locale)}
                </Link>
              </li>
              <li>
                <Link
                  to="/catalog"
                  onClick={() => {
                    setBrandFilter('all')
                    setCategoryFilter('Аксессуары')
                  }}
                >
                  {localizeCategory('Аксессуары', locale)}
                </Link>
              </li>
              <li>
                <Link
                  to="/catalog"
                  onClick={() => {
                    setBrandFilter('all')
                    setCategoryFilter('all')
                  }}
                >
                  {t.fullCatalog}
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.col}>
            <h3 className={styles.heading}>{t.customers}</h3>
            <ul className={styles.links}>
              <li>
                <Link to="/delivery">{t.deliveryPayment}</Link>
              </li>
              <li>
                <Link to="/about">{t.warranty}</Link>
              </li>
              <li>
                <Link to="/contacts">{t.contacts}</Link>
              </li>
              <li>
                <Link to="/orders">{t.orders}</Link>
              </li>
              <li>
                <Link to="/about">{t.offer}</Link>
              </li>
            </ul>
          </div>

          <div className={styles.col}>
            <h3 className={styles.heading}>{t.actual}</h3>
            <ul className={styles.links}>
              <li>
                <Link to="/catalog">{t.newItems}</Link>
              </li>
              <li>
                <Link to="/catalog">{t.bestsellers}</Link>
              </li>
              <li>
                <Link to="/catalog" className={styles.linkSale}>
                  Sale %
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.col}>
            <h3 className={styles.heading}>{t.connection}</h3>
            <ul className={styles.contacts}>
              <li>
                <a href="tel:+380800123456">0 800 123 456</a>
              </li>
              <li>
                <a href="tel:+380441234567">+38 (044) 123-45-67</a>
              </li>
            </ul>
            <p className={styles.chatLabel}>{t.chats}</p>
            <div className={styles.messengers}>
              <a href="https://t.me" target="_blank" rel="noreferrer noopener" className={styles.tg} aria-label="Telegram">
                <span aria-hidden="true">TG</span>
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noreferrer noopener"
                className={styles.wa}
                aria-label="WhatsApp"
              >
                <span aria-hidden="true">WA</span>
              </a>
            </div>
            <a href="https://t.me" target="_blank" rel="noreferrer noopener" className={styles.tgChannel}>
              {t.tgChannel}
            </a>
          </div>

          <div className={styles.col}>
            <h3 className={styles.heading}>{t.address}</h3>
            <p className={styles.address}>{t.addressText}</p>
            <p className={styles.hours}>{t.hours}</p>
          </div>
        </div>

        <div className={styles.legal}>
          <div className={styles.legalLeft}>
            <BrandLogo variant="footer" to="/" />
            <p className={styles.copy}>{t.rights}</p>
          </div>
          <div className={styles.legalLinks}>
            <Link to="/catalog">{t.siteMap}</Link>
            <Link to="/about">{t.privacy}</Link>
            <Link to="/admin">{t.admin}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
