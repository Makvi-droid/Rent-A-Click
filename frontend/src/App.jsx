import LandingPage from "./pages/LandingPage"
import Auth from "./pages/Auth"
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { ToastProvider } from "./components/Authentication/Toast";


function App() {
  

  return (
    <>
    <ToastProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/homePage" element={<HomePage/>}/>
      </Routes>
    </ToastProvider>
    
    </>
  )
}

export default App
