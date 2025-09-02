import LandingPage from "./pages/LandingPage"
import Auth from "./pages/Auth"
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { ToastProvider } from "./components/Authentication/Toast";
import Footer from "./components/Landing/Footer";
import ProfilePage from "./pages/ProfilePage";


function App() {
  

  return (
    <>
    <ToastProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/homePage" element={<HomePage/>}/>
        <Route path="/profilePage" element={<ProfilePage/>}/>
      </Routes>
      <Footer/>
    </ToastProvider>
    
    </>
  )
}

export default App
