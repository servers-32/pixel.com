import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'
import { useI18n } from '../i18n'

export function NotFoundPage() {
  const { locale, t } = useI18n()
  useEffect(() => {
    document.title = t('seo.notFound')
  }, [t])

  return (
    <div className={styles.wrap}>
      <p className={styles.code} aria-hidden>
        404
      </p>
      <h1 className={styles.title}>{locale === 'en' ? 'Page not found' : locale === 'uk' ? 'Сторінку не знайдено' : 'Страница не найдена'}</h1>
      <p className={styles.text}>
        {locale === 'en'
          ? 'Check the address or open the catalog.'
          : locale === 'uk'
            ? 'Перевірте адресу або перейдіть до каталогу.'
            : 'Проверьте адрес или перейдите в каталог.'}
      </p>
      <div className={styles.row}>
        <Link to="/" className={styles.primary}>
          {locale === 'en' ? 'Home' : locale === 'uk' ? 'На головну' : 'На главную'}
        </Link>
        <Link to="/catalog" className={styles.secondary}>
          {t('common.catalog')}
        </Link>
      </div>
    </div>
  )
}
