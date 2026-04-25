import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Mainpage from "./screens/MainPage";
import ProfilePage from "./screens/ProfilePage"; // افترضنا أنك أنشأت هذا الملف

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* الصفحة الرئيسية */}
          <Route path="/" element={<Mainpage />} />

          {/* صفحة الملف الشخصي */}
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
