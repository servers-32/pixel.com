import { Outlet } from 'react-router-dom'
import { useStoreDocumentTitle } from '../hooks/useStoreDocumentTitle'
import { AnnouncementBar } from './AnnouncementBar'
import { CommandPalette } from './CommandPalette'
import { CartDrawer } from './CartDrawer'
import { CompareDock } from './CompareDock'
import { StoreErrorBoundary } from './ErrorBoundary'
import { Footer } from './Footer'
import { Header } from './Header'
import { ScrollToTop } from './ScrollToTop'
import { ToastStack } from './ToastStack'
import { useI18n } from '../i18n'

export function StoreLayout() {
  const { t } = useI18n()
  useStoreDocumentTitle()
  return (
    <div className="app-shell store-chrome">
      <ScrollToTop />
      <a href="#main-content" className="skip-link">
        {t('common.skipToContent')}
      </a>
      <AnnouncementBar />
      <Header />
      <main className="app-main" id="main-content">
        <StoreErrorBoundary>
          <Outlet />
        </StoreErrorBoundary>
      </main>
      <Footer />
      <ToastStack />
      <CartDrawer />
      <CompareDock />
      <CommandPalette />
    </div>
  )
}
