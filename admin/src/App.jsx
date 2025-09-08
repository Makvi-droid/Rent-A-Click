import Auth from "./Pages/Auth"
import { ToastProvider } from "../src/Components/Authentication/Toast"
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./Pages/AdminDashBoard";

function App() {

  return (
    <>
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Auth/>}/>
        <Route path="/auth" element={<Auth/>}/>
        <Route path="/adminDashBoard" element={<AdminDashboard/>}/>
      </Routes>
    </ToastProvider>
    </>
  )
}

export default App
