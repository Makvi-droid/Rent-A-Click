import LandingPage from "./pages/LandingPage"
import Auth from "./pages/Auth"
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";


function App() {
  

  return (
    <>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/homePage" element={<HomePage/>}/>
    </Routes>
    
    </>
  )
}

export default App
