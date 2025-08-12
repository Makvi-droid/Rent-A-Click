import LandingPage from "./pages/LandingPage"
import HomePage from "./pages/HomePage"
import Auth from "./pages/Auth"
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </>
  )
}

export default App
