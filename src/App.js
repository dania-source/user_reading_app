import React, { useState, useEffect } from "react"; // أضفنا useState و useEffect
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Mainpage from "./screens/MainPage";
import ProfilePage from "./screens/ProfilePage";
import UserProfile from "./screens/UserProfile";

function App() {
  // 1. تعريف حالة المستخدم (User State)
  // بنحاول نقرأ البيانات من localStorage فوراً عشان ما تظهر شاشة تسجيل الدخول للحظة
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // 2. تحديث الحالة في حال تغير الـ localStorage (اختياري لزيادة التأكيد)
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && !user) {
      setUser(JSON.parse(savedUser));
    }
  }, [user]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 3. نمرر user و setUser كـ props للصفحة الرئيسية عشان تستخدمهم في الـ Navbar */}
          <Route
            path="/"
            element={<Mainpage user={user} setUser={setUser} />}
          />

          <Route path="/user-profile/:userId" element={<UserProfile />} />

          {/* 4. نمرر بيانات المستخدم لصفحة البروفايل أيضاً */}
          <Route
            path="/profile"
            element={<ProfilePage user={user} setUser={setUser} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
