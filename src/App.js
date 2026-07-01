import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Mainpage from "./screens/MainPage";
import ProfilePage from "./screens/ProfilePage";
import UserProfile from "./screens/UserProfile";
import BookDetailsPage from "./screens/BookDetailsPage"; // 1. استيراد صفحة تفاصيل الكتاب الجديدة

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    
    const savedUser = localStorage.getItem("user");
    if (savedUser && !user) {
      setUser(JSON.parse(savedUser));
    }
  }, [user]);

  // تعيين اللون الأساسي للتطبيق هنا ليمرر لكل الصفحات
  const mainColor = "#541029";

  // دالة قراءة الكتاب عند الضغط على زر القراءة
  const handleReadClick = (pdfPath) => {
    if (pdfPath) {
      window.open(pdfPath, "_blank"); // يفتح رابط الـ PDF في نافذة جديدة
    } else {
      alert("عذراً، رابط الكتاب غير متاح حالياً.");
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* نمرر user و setUser كـ props للصفحة الرئيسية */}
          <Route
            path="/"
            element={
              <Mainpage user={user} setUser={setUser} mainColor={mainColor} />
            }
          />

          <Route path="/user-profile/:userId" element={<UserProfile />} />

          {/* نمرر بيانات المستخدم لصفحة البروفايل أيضاً */}
          <Route
            path="/profile"
            element={<ProfilePage user={user} setUser={setUser} />}
          />

          {/* ⚠️ تعديل وإضافة مسارات صفحة تفاصيل الكتاب لتطابق الـ جمع والمفرد */}
          <Route
            path="/books/:id" // 👈 هذا المسار بالجمع ليطابق الانتقال من الاقتراحات (/books/3)
            element={
              <BookDetailsPage
                mainColor={mainColor}
                handleReadClick={handleReadClick}
              />
            }
          />

          <Route
            path="/book/:id" // 👈 تركناه كمسار احتياطي في حال كان مستخدماً في مكان آخر بالمنصة
            element={
              <BookDetailsPage
                mainColor={mainColor}
                handleReadClick={handleReadClick}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
