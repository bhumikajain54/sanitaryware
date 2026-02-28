import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LandingNavbar from './components/LandingPage/LandingNavbar';
import AdminOrderDrafts from './pages/admin/AdminOrderDrafts';

// Lazy loaded components
const CustomerLogin = lazy(() => import('./pages/CustomerLogin'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
// const Home = lazy(() => import('./pages/customer/Home')); // Removed - using Dashboard instead
const Products = lazy(() => import('./pages/customer/Products'));
const ProductDetail = lazy(() => import('./pages/customer/ProductDetail'));
const Cart = lazy(() => import('./pages/customer/Cart'));
const Checkout = lazy(() => import('./pages/customer/Checkout'));
const Dashboard = lazy(() => import('./pages/customer/Dashboard'));
const Orders = lazy(() => import('./pages/customer/Orders'));
const Profile = lazy(() => import('./pages/customer/Profile'));
const Addresses = lazy(() => import('./pages/customer/Addresses'));
const Notifications = lazy(() => import('./pages/customer/Notifications'));
// const Contact = lazy(() => import('./pages/customer/Contact')); // Removed - using Support.jsx instead
const Support = lazy(() => import('./pages/customer/Support'));
// const Brands = lazy(() => import('./pages/customer/Brands')); // Removed
const PaymentGateways = lazy(() => import('./pages/customer/PaymentGateways'));
const Wishlist = lazy(() => import('./pages/customer/Wishlist'));
const HelpFAQ = lazy(() => import('./pages/HelpFAQ'));
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy'));
const ShippingInfo = lazy(() => import('./pages/ShippingInfo'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const ProductsLanding = lazy(() => import('./pages/ProductsLanding'));
const LandingContact = lazy(() => import('./pages/LandingContact'));
const Preferences = lazy(() => import('./pages/customer/Preferences'));

// Admin Pages
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboardNew = lazy(() => import('./pages/admin/AdminDashboardNew'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminBrands = lazy(() => import('./pages/admin/AdminBrands'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'));
const AdminInquiries = lazy(() => import('./pages/admin/AdminInquiries'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia'));
const AdminContent = lazy(() => import('./pages/admin/AdminContent'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const AdminBilling = lazy(() => import('./pages/admin/AdminBilling'));
const AdminQuotations = lazy(() => import('./pages/admin/AdminQuotations'));
const AdminTally = lazy(() => import('./pages/admin/AdminTally'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// Customer Layout
const CustomerLayoutWithSidebar = lazy(() => import('./components/customer/CustomerLayout'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
    <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4 shadow-xl shadow-teal-100"></div>
    <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Singhai Traders...</p>
  </div>
);

// Protected Route Component for Customers
const ProtectedCustomerRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/customer/login" state={{ from: location }} replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Protected Route Component for Admin
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/customer/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/customer/dashboard" replace />;
  }

  return children;
};

// Redirect Admin to Dashboard if trying to access public/customer pages
const RedirectIfAdmin = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Premium Layout with Landing Navbar and Footer
const LandingLayout = ({ children }) => {
  return (
    <>
      <LandingNavbar />
      {children}
      <Footer />
    </>
  );
};

// Default Layout with Common Navbar and Footer
const LayoutWithNavbar = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

// Conditional Layout for Cart based on Auth
const ConditionalCartLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return (
      <CustomerLayoutWithSidebar>
        {children}
      </CustomerLayoutWithSidebar>
    );
  }

  return (
    <LandingLayout>
      {children}
    </LandingLayout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <CartProvider>
            <ProductProvider>
              <WishlistProvider>
                <Toaster position="bottom-right" />
                <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedAdminRoute>
                      <AdminLayout />
                    </ProtectedAdminRoute>
                  }
                >
                  <Route index element={<AdminDashboardNew />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="brands" element={<AdminBrands />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="testimonials" element={<AdminTestimonials />} />
                  <Route path="banners" element={<AdminBanners />} />
                  <Route path="inquiries" element={<AdminInquiries />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="media" element={<AdminMedia />} />
                  <Route path="content" element={<AdminContent />} />
                  <Route path="notifications" element={<AdminNotifications />} />
                  <Route path="billing" element={<AdminBilling />} />
                  <Route path="quotations" element={<AdminQuotations />} />
                  <Route path="order-drafts" element={<AdminOrderDrafts />} />
                  <Route path="tally" element={<AdminTally />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Public Routes */}
                <Route path="/" element={<RedirectIfAdmin><LandingLayout><LandingPage /></LandingLayout></RedirectIfAdmin>} />
                <Route path="/shop" element={<LandingLayout><ProductsLanding/></LandingLayout>} />
                <Route
                  path="/cart"
                  element={
                    <ConditionalCartLayout>
                      <Cart />
                    </ConditionalCartLayout>
                  }
                />
                {/* Login Routes */}
                <Route path="/customer/login" element={<CustomerLogin />} />
                <Route path="/admin/login" element={<Navigate to="/customer/login" replace />} />
                {/* Legacy login route - redirect to customer login */}
                <Route path="/login" element={<Navigate to="/customer/login" replace />} />

                {/* Customer Home (Protected - After Login) - REMOVED, using Dashboard instead */}
                {/* <Route
                  path="/home"
                  element={
                    <ProtectedCustomerRoute>
                      <CustomerLayoutWithSidebar>
                        <Home />
                      </CustomerLayoutWithSidebar>
                    </ProtectedCustomerRoute>
                  }
                /> */}

                {/* Protected Customer Routes */}
                <Route
                  path="/products"
                  element={
                    <ProtectedCustomerRoute>
                      <CustomerLayoutWithSidebar>
                        <Products />
                      </CustomerLayoutWithSidebar>
                    </ProtectedCustomerRoute>
                  }
                />
                <Route
                  path="/product/:id"
                  element={
                    <ProtectedCustomerRoute>
                      <CustomerLayoutWithSidebar>
                        <ProductDetail />
                      </CustomerLayoutWithSidebar>
                    </ProtectedCustomerRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedCustomerRoute>
                      <CustomerLayoutWithSidebar>
                        <Checkout />
                      </CustomerLayoutWithSidebar>
                    </ProtectedCustomerRoute>
                  }
                />
                <Route
                  path="/payment-gateway"
                  element={
                    <ProtectedCustomerRoute>
                      <PaymentGateways />
                    </ProtectedCustomerRoute>
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <LandingLayout>
                      <LandingContact />
                    </LandingLayout>
                  }
                />
                {/* <Route
                  path="/brands"
                  element={
                    <ProtectedCustomerRoute>
                      <CustomerLayoutWithSidebar>
                        <Brands />
                      </CustomerLayoutWithSidebar>
                    </ProtectedCustomerRoute>
                  }
                /> */}
                {/* <Route
                  path="/about"
                  element={
                    <ProtectedCustomerRoute>
                      <CustomerLayoutWithSidebar>
                        <AboutUs />
                      </CustomerLayoutWithSidebar>
                    </ProtectedCustomerRoute>
                  }
                /> */}
                <Route
                  path="/help"
                  element={
                    <LandingLayout>
                      <HelpFAQ />
                    </LandingLayout>
                  }
                />
                <Route
                  path="/return-policy"
                  element={
                    <LandingLayout>
                      <ReturnPolicy />
                    </LandingLayout>
                  }
                />
                <Route
                  path="/shipping-info"
                  element={
                    <LandingLayout>
                      <ShippingInfo />
                    </LandingLayout>
                  }
                />
                <Route
                  path="/terms"
                  element={
                    <LandingLayout>
                      <TermsConditions />
                    </LandingLayout>
                  }
                />
                <Route
                  path="/privacy"
                  element={
                    <LandingLayout>
                      <PrivacyPolicy />
                    </LandingLayout>
                  }
                />

                {/* Protected Customer Routes */}
                <Route
                  path="/customer/dashboard"
                  element={
                    <ProtectedCustomerRoute>
                      <CustomerLayoutWithSidebar>
                        <Dashboard />
                      </CustomerLayoutWithSidebar>
                    </ProtectedCustomerRoute>
                  }
                />
                <Route
                  path="/customer/orders"
                  element={
                    <ProtectedCustomerRoute>
                      <CustomerLayoutWithSidebar>
                        <Orders />
                      </CustomerLayoutWithSidebar>
                    </ProtectedCustomerRoute>
                  }
                />
                <Route
                  path="/customer/contact"
                  element={
                    <ProtectedCustomerRoute>
                      <CustomerLayoutWithSidebar>
                        <Support />
                      </CustomerLayoutWithSidebar>
                    </ProtectedCustomerRoute>
                  }
                />
                <Route
                  path="/customer/profile"
                  element={
                    <ProtectedCustomerRoute>
                      <CustomerLayoutWithSidebar>
                        <Profile />
                      </CustomerLayoutWithSidebar>
                    </ProtectedCustomerRoute>
                  }
                />
                <Route
                  path="/customer/addresses"
                  element={
                    <ProtectedCustomerRoute>
                      <CustomerLayoutWithSidebar>
                        <Addresses />
                      </CustomerLayoutWithSidebar>
                    </ProtectedCustomerRoute>
                  }
                />
                <Route
                  path="/customer/preferences"
                  element={
                    <ProtectedCustomerRoute>
                      <CustomerLayoutWithSidebar>
                        <Preferences />
                      </CustomerLayoutWithSidebar>
                    </ProtectedCustomerRoute>
                  }
                />
                <Route
                  path="/customer/notifications"
                  element={
                    <ProtectedCustomerRoute>
                      <CustomerLayoutWithSidebar>
                        <Notifications />
                      </CustomerLayoutWithSidebar>
                    </ProtectedCustomerRoute>
                  }
                />
                <Route
                  path="/customer/wishlist"
                  element={
                    <ProtectedCustomerRoute>
                      <CustomerLayoutWithSidebar>
                        <Wishlist />
                      </CustomerLayoutWithSidebar>
                    </ProtectedCustomerRoute>
                  }
                />

                {/* 404 Route */}
                <Route
                  path="*"
                  element={
                    <LayoutWithNavbar>
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                          <h1 className="text-6xl font-playfair font-bold text-dark mb-4">
                            404
                          </h1>
                          <p className="text-xl text-gray-600 mb-8">
                            Page not found
                          </p>
                          <a href="/" className="btn-primary">
                            Go Home
                          </a>
                        </div>
                      </div>
                    </LayoutWithNavbar>
                  }
                />
              </Routes>
            </Suspense>
          </WishlistProvider>
        </ProductProvider>
      </CartProvider>
      </ThemeProvider>
    </AuthProvider>
    </Router>
  );
}

export default App;
