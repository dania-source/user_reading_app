import React, { useState } from "react";
import {
  Box, TextField, Button, Typography, InputAdornment,
  IconButton, Grid, CircularProgress, Stack
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  Email, Lock, Person, Visibility, VisibilityOff,
  MenuBook, ArrowForward, PhotoCamera, Close
} from "@mui/icons-material";
import axios from "axios";

const Auth = ({ onSuccess, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImg, setProfileImg] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfileImg(e.target.files[0]);
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? "/login" : "/register";
    const url = `http://localhost:8000/api${endpoint}`;

    const data = new FormData();
    data.append("email", formData.email);
    data.append("password", formData.password);

    if (!isLogin) {
      data.append("name", formData.name);
      data.append("password_confirmation", formData.password_confirmation);
      if (profileImg) {
        data.append("profile_img", profileImg);
      }
    }

    try {
      const response = await axios.post(url, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json"
        },
      });

      if (response.data.success || response.status === 200) {
        const responseData = response.data.data;

        // 1. تخزين التوكن
        localStorage.setItem("token", responseData.token);

        // 2. استخراج وتخزين الـ ID
        const userId = responseData.user_id || responseData.id || (responseData.user && responseData.user.id);
        if (userId) {
          localStorage.setItem("user_id", String(userId).trim());
        }

        // 3. استخراج وتخزين الاسم
        const userName = responseData.user_name || responseData.name || (responseData.user && responseData.user.name);
        if (userName) {
          localStorage.setItem("user_name", String(userName).trim());
        }

        // 4. 🔥 [التعديل الجديد] استخراج وتخزين رابط الصورة الشخصية
        // يفحص كافة الاحتمالات لرجوع الصورة من السيرفر (profile_img أو avatar أو داخل كائن user)
        const userImg = responseData.profile_img || responseData.avatar || (responseData.user && (responseData.user.profile_img || responseData.user.avatar));
        if (userImg) {
          // تأكد إذا كان السيرفر يعيد الرابط كاملاً، أو يحتاج إضافة رابط السيرفر الأساسي مثل: http://localhost:8000/storage/
          const fullImageUrl = userImg.startsWith('http') ? userImg : `http://localhost:8000/${userImg}`;
          localStorage.setItem("user_image", fullImageUrl.trim());
        }

        if (onSuccess) onSuccess(); 
      }
    } catch (error) {
      alert(error.response?.data?.message || "حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
};

  const mainColor = "#541029";
  const gradientBg = "linear-gradient(135deg, #541029 0%, #821c3e 100%)";

  return (
    <Box sx={{ 
      display: "flex", 
      flexDirection: { xs: "column", md: "row" }, 
      width: "100%", 
      minHeight: { md: "550px" },
      position: "relative",
      bgcolor: "#EFEDE1" // لتوحيد الخلفية ومنع البياض
    }}>
      
      {/* زر الإغلاق */}
      <IconButton 
        onClick={onClose} 
        sx={{ position: "absolute", right: 8, top: 8, zIndex: 10, color: "#333" }}
      >
        <Close />
      </IconButton>

      {/* القسم الأيسر: الترحيب (خلفية بوردو) */}
      <Box sx={{
        flex: { md: 1 },
        background: gradientBg,
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 4,
        textAlign: "center"
      }}>
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <MenuBook sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
        </motion.div>
        <Typography variant="h4" fontWeight="800" sx={{ fontFamily: "Cairo" }}>
          {isLogin ? "مرحباً بك!" : "انضم إلينا"}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mt: 2, maxWidth: 200, fontFamily: "Cairo", lineHeight: 1.6 }}>
          {isLogin ? "سجل دخولك لتكمل رحلتك في عالم الكتب." : "ابدأ بتنظيم قراءاتك وبناء مكتبتك الخاصة اليوم."}
        </Typography>
      </Box>

      {/* القسم الأيمن: الفورم (الحركة الانسيابية) */}
      <Box sx={{
        flex: { md: 1.5 },
        p: { xs: 3, md: 6 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        direction: "rtl"
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? "login" : "signup"}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Typography variant="h5" fontWeight="700" color="#333" mb={1} sx={{ fontFamily: "Cairo" }}>
              {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
            </Typography>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 2 }}>
              {!isLogin && (
                <>
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <IconButton component="label" sx={{ width: 80, height: 80, border: `1px dashed ${mainColor}`, color: mainColor }}>
                      <PhotoCamera />
                      <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                    </IconButton>
                    {profileImg && <Typography variant="caption" display="block">{profileImg.name}</Typography>}
                  </Box>
                  <TextField
                    fullWidth size="small" name="name" placeholder="الاسم الكامل" margin="dense" variant="outlined"
                    onChange={handleChange} sx={{ mb: 1, bgcolor: "white" }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: mainColor }} /></InputAdornment> }}
                  />
                </>
              )}

              <TextField
                fullWidth size="small" name="email" placeholder="البريد الإلكتروني" margin="dense" variant="outlined"
                onChange={handleChange} sx={{ mb: 1, bgcolor: "white" }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: mainColor, fontSize: 20 }} /></InputAdornment> }}
              />

              <TextField
                fullWidth size="small" name="password" type={showPassword ? "text" : "password"} placeholder="كلمة المرور"
                margin="dense" variant="outlined" onChange={handleChange} sx={{ mb: 1, bgcolor: "white" }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock sx={{ color: mainColor, fontSize: 20 }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {!isLogin && (
                <TextField
                  fullWidth size="small" name="password_confirmation" type="password" placeholder="تأكيد كلمة المرور"
                  margin="dense" variant="outlined" onChange={handleChange} sx={{ mb: 1, bgcolor: "white" }}
                />
              )}

              <Button
                fullWidth type="submit" variant="contained" disabled={loading}
                sx={{
                  mt: 3, py: 1.2, borderRadius: "8px", background: gradientBg, fontFamily: "Cairo",
                  "&:hover": { background: mainColor }
                }}
                endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward sx={{ transform: "rotate(180deg)" }} />}
              >
                {isLogin ? "دخول" : "إنشاء الحساب"}
              </Button>

              <Box textAlign="center" mt={2}>
                <Button onClick={() => setIsLogin(!isLogin)} sx={{ fontFamily: "Cairo", fontSize: "0.8rem", color: "#1a73e8" }}>
                  {isLogin ? "لا تملك حساباً؟ اشترك الآن" : "لديك حساب بالفعل؟ سجل دخولك"}
                </Button>
              </Box>
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default Auth;