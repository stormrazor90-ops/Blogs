// App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import MagneticCursor from "./components/MagneticCursor";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import PostDetails from "./pages/PostDetails";
import WeeklyDigest from "./pages/WeeklyDigest";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";


function App() {
  return (
    <BrowserRouter>
      {/* Custom cursor — active on every page */}
      <MagneticCursor />
      <Navbar />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/post/:slug" element={<PostDetails />} />
          <Route path="/digest" element={<WeeklyDigest />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;