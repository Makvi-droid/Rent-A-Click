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
      </Routes>
      <Footer/>
    </ToastProvider>
    
    </>
  )
}

export default App
