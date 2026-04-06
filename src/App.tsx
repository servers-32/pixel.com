import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RouteFallback } from './components/RouteFallback'
import { StoreLayout } from './components/StoreLayout'
import { ShopProvider } from './context/ShopContext'
import { I18nProvider } from './i18n'
import './App.css'

const HomePage = lazy(() => import('./components/HomePage').then((m) => ({ default: m.HomePage })))
const ProductList = lazy(() => import('./components/ProductList').then((m) => ({ default: m.ProductList })))
const ProductDetails = lazy(() =>
  import('./components/ProductDetails').then((m) => ({ default: m.ProductDetails })),
)
const Cart = lazy(() => import('./components/Cart').then((m) => ({ default: m.Cart })))
const CheckoutLayout = lazy(() =>
  import('./components/checkout/CheckoutLayout').then((m) => ({ default: m.CheckoutLayout })),
)
const CheckoutShipping = lazy(() =>
  import('./components/checkout/CheckoutShipping').then((m) => ({ default: m.CheckoutShipping })),
)
const CheckoutPayment = lazy(() =>
  import('./components/checkout/CheckoutPayment').then((m) => ({ default: m.CheckoutPayment })),
)
const CheckoutSuccess = lazy(() =>
  import('./components/checkout/CheckoutSuccess').then((m) => ({ default: m.CheckoutSuccess })),
)
const LoginPage = lazy(() => import('./components/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./components/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const AccountPage = lazy(() => import('./components/AccountPage').then((m) => ({ default: m.AccountPage })))
const OrdersPage = lazy(() => import('./components/OrdersPage').then((m) => ({ default: m.OrdersPage })))
const InfoPage = lazy(() => import('./components/InfoPage').then((m) => ({ default: m.InfoPage })))
const NotFoundPage = lazy(() => import('./components/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const AnalyticsDashboard = lazy(() =>
  import('./components/AnalyticsDashboard').then((m) => ({ default: m.AnalyticsDashboard })),
)
const AdminPage = lazy(() => import('./components/AdminPage').then((m) => ({ default: m.AdminPage })))
const WishlistPage = lazy(() => import('./components/WishlistPage').then((m) => ({ default: m.WishlistPage })))

const routerBasename =
  import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <I18nProvider>
        <ShopProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route element={<StoreLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/catalog" element={<ProductList />} />
                <Route path="/product/:productId" element={<ProductDetails />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<CheckoutLayout />}>
                  <Route index element={<CheckoutShipping />} />
                  <Route path="payment" element={<CheckoutPayment />} />
                  <Route path="success/:orderId" element={<CheckoutSuccess />} />
                </Route>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/about" element={<InfoPage kind="about" />} />
                <Route path="/delivery" element={<InfoPage kind="delivery" />} />
                <Route path="/contacts" element={<InfoPage kind="contacts" />} />
                <Route path="/analytics" element={<AnalyticsDashboard />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </ShopProvider>
      </I18nProvider>
    </BrowserRouter>
  )
}
