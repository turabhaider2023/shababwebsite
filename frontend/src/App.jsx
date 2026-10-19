import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Protected from './components/Protected';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Info from './pages/Info';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import ProductForm from './pages/admin/ProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminSubcategories from './pages/admin/AdminSubcategories';
import AdminWhatsApp from './pages/admin/AdminWhatsApp';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="product/:slug" element={<ProductPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="about" element={<Info page="about" />} />
                  <Route path="shipping" element={<Info page="shipping" />} />
                  <Route path="returns" element={<Info page="returns" />} />
                  <Route path="account" element={<Protected><Account /></Protected>} />
                  <Route path="orders" element={<Protected><Orders /></Protected>} />
                  <Route path="orders/:id" element={<OrderDetail />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="admin/login" element={<AdminLogin />} />
                <Route
                  path="admin"
                  element={
                    <Protected admin>
                      <AdminLayout />
                    </Protected>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/:id/edit" element={<ProductForm />} />
                  <Route path="subcategories" element={<AdminSubcategories />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="orders/:id" element={<AdminOrderDetail />} />
                  <Route path="whatsapp" element={<AdminWhatsApp />} />
                </Route>
              </Routes>
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
