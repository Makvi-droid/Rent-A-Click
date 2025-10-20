import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { ToastProvider } from "./components/Authentication/Toast";
import Footer from "./components/Landing/Footer";
import ProfilePage from "./pages/ProfilePage";
import ProductsPage from "./pages/ProductsPage";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from "./admin/pages/AdminDashBoard";
import AddToCart from "./pages/AddToCart";
import Checkout from "./pages/Checkout";
import Inventory from "./admin/pages/Inventory";
import MyRentals from "./pages/MyRentals";
import UserManagement from "./admin/pages/UserManagement";
import Dashboard from "./admin/pages/Dashboard";
import { db } from "./firebase";
import Reviews from "./pages/Reviews";
import Settings from "./pages/Settings";
import Billings from "./pages/Billings";
import SecuritySettings from "./pages/SecuritySettings";
import Notifications from "./pages/Notifications";
import Help from "./pages/Help";
import AccountPage from "./pages/AccountPage";
import NotificationPage from "./pages/NotificationPage";
import HelpSupportPage from "./pages/HelpSupportPage";

function App() {
  return (
    <>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/homePage" element={<HomePage />} />
          <Route path="/profilePage" element={<ProfilePage />} />
          <Route path="/productsPage" element={<ProductsPage />} />
          <Route path="/wishlistPage" element={<Wishlist />} />
          <Route path="/adminDashboard" element={<AdminDashboard />} />
          <Route path="/cartPage" element={<AddToCart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/rentals" element={<MyRentals />} />
          <Route path="/userManagement" element={<UserManagement />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/billing" element={<Billings />} />
          <Route path="/security" element={<SecuritySettings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/help" element={<Help />} />
          <Route path="/accountsPage" element={<AccountPage />} />
          <Route path="/notificationPage" element={<NotificationPage />} />
          <Route path="/helpSupportPage" element={<HelpSupportPage />} />
        </Routes>
        <Footer />
      </ToastProvider>
    </>
  );
}

export default App;
