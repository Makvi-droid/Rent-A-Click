import LandingPage from "./pages/LandingPage"
import Auth from "./pages/Auth"
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
import Inventory from "./admin/pages/Inventory"
import MyRentals from "./pages/MyRentals";


function App() {
  

  return (
    <>
    <ToastProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/homePage" element={<HomePage/>}/>
        <Route path="/profilePage" element={<ProfilePage/>}/>
        <Route path="/productsPage" element={<ProductsPage/>}/>
        <Route path="/wishlistPage" element={<Wishlist/>}/>
        <Route path="/adminDashboard" element={<AdminDashboard/>}/>
        <Route path="/cartPage" element={<AddToCart/>}/>
        <Route path="/checkout" element={<Checkout/>}/>
        <Route path="/inventory" element={<Inventory/>}/>
        <Route path="/rentals" element={<MyRentals/>}/>
      </Routes>
      <Footer/>
    </ToastProvider>
    
    </>
  )
}

export default App
