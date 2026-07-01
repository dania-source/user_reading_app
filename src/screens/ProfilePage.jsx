import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Paper, Avatar, Grid, Button,
  Tabs, Tab, IconButton, Badge, Snackbar, TextField, CircularProgress, Alert,
  Menu, MenuItem, Divider, ListItemIcon, DialogActions, Dialog, DialogTitle, DialogContent, DialogContentText
} from '@mui/material';
import { 
  Edit , People, PersonAdd, Lightbulb, Assessment, 
  Settings, Logout,  CameraAlt, Key, Delete 
} from '@mui/icons-material';
import axios from 'axios';
import BookCard from './BookCard';
import { Favorite } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:8000";
const mainColor = '#541029';

const ProfilePage = () => {

  // 1. الحالات الأساسية
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  // 2. بيانات التبويبات
  const [favorites, setFavorites] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  
  // حالة لتتبع أي الأقسام تم الضغط فيها على "عرض المزيد"
  const [expandedSections, setExpandedSections] = useState({});
  
  // 💡 الحالات لتخزين مصفوفات الكتب كاملة لعرضها أسفل كروت الإحصائيات
  const [bookListData, setBookListData] = useState({
    finished: [],
    reading: [],
    wantToRead: []
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // 3. حالات القوائم والنماذج
  const [anchorEl, setAnchorEl] = useState(null);
  const [suggestForm, setSuggestForm] = useState({ title: "", author: "", description: "", related_book_id: "" });
  const [snack, setSnack] = useState({ open: false, message: "", color: "success" });

  // 👁️ 💡 الحالات الجديدة المضافة لإعدادات الحساب وكلمة المرور
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openDeleteAccDialog, setOpenDeleteAccDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    password: '',
    password_confirmation: ''
  });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}`, 'Accept': 'application/json' } };
  const openSettings = Boolean(anchorEl);
  const [openConfirm, setOpenConfirm] = useState(false);
  
  const handleMenuClose = () => setAnchorEl(null);
  const handleConfirmOpen = () => {
    handleMenuClose(); 
    setOpenConfirm(true); 
  };
  const handleConfirmClose = () => setOpenConfirm(false);
  const navigate = useNavigate(); 

  // جلب البيانات عند التحميل الأول
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/info`, config);
        setUserData(res.data.data);
        setStats(res.data.stats);
        
        const favRes = await axios.get(`${API_URL}/api/favorites`, config);
        setFavorites(favRes.data.data);

        const followersRes = await axios.get(`${API_URL}/api/followers`, config);
        setFollowers(followersRes.data.data.followers || followersRes.data.data || []);

        const followingRes = await axios.get(`${API_URL}/api/following`, config);
        setFollowing(followingRes.data.data.following || followingRes.data.data || []);

      } catch (err) {
        console.error("Error fetching base info", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // دالة جلب قوائم الكتب وتخزين المصفوفات كاملة للإحصائيات والمكتبة
  const fetchBookListStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch(`${API_URL}/api/book_list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setBookListData({
          wantToRead: result.data['أرغب بقراءته'] || [],
          reading: result.data['أقرأها الآن'] || [],
          finished: result.data['أنهيتها'] || []
        });
      }
    } catch (error) {
      console.error("خطأ في جلب إحصائيات الكتب:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  // تشغيل الدالة فور الانتقال للتبويب الخامس (الإحصائيات)
  useEffect(() => {
    if (tabValue === 5) {
      fetchBookListStats();
    }
  }, [tabValue]);

  const handleTabChange = async (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 4 || newValue === 5 || newValue === 6) return; 

    setTabLoading(true);
    try {
      let endpoint = "";
      if (newValue === 0) endpoint = "/api/favorites";
      else if (newValue === 1) endpoint = "/api/followers";
      else if (newValue === 2) endpoint = "/api/following";
      else if (newValue === 3) endpoint = "/api/suggestions/mine";

      if (endpoint) {
        const res = await axios.get(`${API_URL}${endpoint}`, config);  
        if (newValue === 1) setFollowers(res.data.data.followers || res.data.data); 
        else if (newValue === 2) setFollowing(res.data.data.following || res.data.data); 
        else if (newValue === 3) setSuggestions(res.data.data);
      }
    } catch (err) {
      console.error("Error loading tab content", err);
    } finally {
      setTabLoading(false);
    }
  };

const handleLogout = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.post(`${API_URL}/api/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  } catch (error) {
    console.error("خطأ أثناء تسجيل الخروج من الخادم:", error);
  } finally { 
    // 🌟 سيمسح التوكن والمستخدم وحالات الكتب وكل شيء مخزن محلياً
    localStorage.clear(); 
    
    setOpenConfirm(false); 
    navigate('/'); 
  }
};
  const handleUpdatePassword = async () => {
    if (!passwordData.old_password || !passwordData.password || !passwordData.password_confirmation) {
      setSnack({ open: true, message: "يرجى ملء جميع حقول كلمات المرور", color: "error" });
      return;
    }

    try {
      const res = await axios.put(`${API_URL}/api/update`, {
        old_password: passwordData.old_password,
        password: passwordData.password,
        password_confirmation: passwordData.password_confirmation
      }, config);

      if (res.data.success) {
        setSnack({ open: true, message: res.data.message, color: "success" });
        setOpenPasswordDialog(false);
        setPasswordData({ old_password: '', password: '', password_confirmation: '' });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "حدث خطأ غير متوقع";
      setSnack({ open: true, message: errMsg, color: "error" });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await axios.delete(`${API_URL}/api/delete-account`, config);
      if (res.data.success) {
        localStorage.clear();
        navigate('/');
      }
    } catch (err) {
      console.error("خطأ أثناء حذف الحساب", err);
      setSnack({ open: true, message: "فشلت عملية حذف الحساب", color: "error" });
    }
  };

  const handleSendSuggestion = async () => {
    try {
      await axios.post(`${API_URL}/api/suggestions`, suggestForm, config);
      setSnack({ open: true, message: "تم إرسال الاقتراح بنجاح", color: "success" });
      setSuggestForm({ title: "", author: "", description: "", related_book_id: "" });
    } catch (err) {
      setSnack({ open: true, message: "فشل إرسال الاقتراح، تأكد من البيانات", color: "error" });
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress sx={{ color: mainColor }} />
    </Box>
  );

  const handleRemoveFavorite = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/api/delete_favorites/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        setFavorites(prevFavorites => prevFavorites.filter(fav => fav.book_id !== bookId && fav.book.id !== bookId));
        setSnack({ open: true, message: "تمت إزالة الكتاب من المفضلة", color: "success" });
      }
    } catch (err) {
      console.error("خطأ أثناء إزالة الكتاب من المفضلة", err);
    }
  };
// حالة لمعرفة إذا كان جاري رفع الصورة (لتمريرها لـ Progress)


const handleAvatarChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return; // إذا لم يختر صورة، اخرج من الدالة

  // 1. تجهيز البيانات كـ FormData لإرسال الملفات
  const formData = new FormData();
  formData.append('profile_img', file); // 'profile_img' يطابق الـ Validation في الباك إند

  // 💡 حل مشكلة الـ PUT في لارافل مع رفع الملفات:
  // نرسل الطلب برمجياً كـ POST ونضيف هذا الحقل ليقرأه لارافل كـ PUT ويستقبل الملف بنجاح
  formData.append('_method', 'PUT'); 

  setUploadingImg(true);
  try {
    const token = localStorage.getItem('token');
    
    // 2. إرسال الطلب عبر .post (مع وجود حقل _method بالداخل ليتجه إلى Route::put)
    const res = await axios.post(`${API_URL}/api/update`, formData, { 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      }
    });

    if (res.data.success) {
      // 3. تحديث واجهة المستخدم بالصورة الجديدة فوراً بناءً على استجابة السيرفر داتا
      const updatedUser = res.data.data.user;
      
      setUserData(prev => ({
        ...prev,
        profile_img: updatedUser.profile_img // سيأخذ رابط الـ asset الراجع من الباك إند مباشرة
      }));

      // 4. تحديث التخزين المحلي (localStorage) حتى لا تختفي الصورة عند تحديث الصفحة (Refresh)
      localStorage.setItem('user', JSON.stringify({
        ...JSON.parse(localStorage.getItem('user')),
        profile_img: updatedUser.profile_img
      }));

      setSnack({ open: true, message: "تم تحديث الصورة الشخصية بنجاح", color: "success" });
    }
  } catch (err) {
    console.error("خطأ أثناء رفع الصورة الشخصية:", err);
    // جلب رسالة الخطأ المحددة من السيرفر إن وجدت (مثل: نوع الصورة غير مدعوم)
    const errorMsg = err.response?.data?.errors?.profile_img?.[0] || "فشل تحميل الصورة الشخصية";
    setSnack({ open: true, message: errorMsg, color: "error" });
  } finally {
    setUploadingImg(false);
  }
};
  return (
    <Box sx={{ bgcolor: '#E4DED2', minHeight: '100vh', direction: 'rtl' }}>
      
      {/* --- الهيدر (الغلاف المعتمد على صورتكِ الجديدة مع المنحنى) --- */}
      <Box 
        sx={{ 
          height: 380, 
          backgroundImage: `url(/images/header-bg.jpg)`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative', 
          width: '100%',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(66, 11, 31, 0.3)', 
            zIndex: 1
          }
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          sx={{
            position: 'absolute',
            bottom: -2, 
            left: 0,
            width: '100%',
            height: '110px', 
            zIndex: 2, 
          }}
        >
          <path
            fill="#E4DED2" 
            fillOpacity="1"
            d="M0,224L120,208C240,192,480,160,720,176C960,192,1200,256,1320,288L1440,320L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
          ></path>
          <path
            d="M0,224L120,208C240,192,480,160,720,176C960,192,1200,256,1320,288L1440,320"
            fill="none" 
            stroke="#D4AF37" 
            strokeWidth="10" 
            strokeLinecap="round" 
          ></path>
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', height: '100%', zIndex: 4 }}>
          <IconButton 
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ 
              position: 'absolute', 
              top: 20, 
              left: 20, 
              bgcolor: 'rgba(255,255,255,0.2)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.4)' },
              zIndex: 10
            }}
          >
            <Settings sx={{ color: 'white' }} />
          </IconButton>

          <Box sx={{ 
            position: 'absolute', 
            bottom: 40, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 3, 
            width: 'auto',
            right: { xs: 'auto', sm: 60 },  
            left: { xs: '50%', sm: 'auto' }, 
            transform: { xs: 'translateX(-50%)', sm: 'none' },
            flexDirection: { xs: 'column', sm: 'row' }, 
            zIndex: 5 
          }}>
           <Badge
  overlap="circular"
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
  badgeContent={
    <>
      {/* 1. زر إدخال ملفات مخفي تماماً عن العين وظيفتها فتح الاستوديو/الملفات */}
      <input
        type="file"
        accept="image/*"
        id="avatar-upload-input"
        style={{ display: 'none' }}
        onChange={handleAvatarChange} // ربطها بالدالة التي كتبناها في الخطوة 1
      />
      
      {/* 2. زر أيقونة الكاميرا الذي يظهر للمستخدم */}
      <label htmlFor="avatar-upload-input">
        <IconButton 
          component="span" // يجعل الضغط على الأيقونة يحفز الـ input المخفي
          disabled={uploadingImg}
          sx={{ 
            bgcolor: 'white', 
            border: `1px solid ${mainColor}`, 
            width: 32, 
            height: 32,
            boxShadow: '0px 2px 5px rgba(0,0,0,0.2)',
            '&:hover': { bgcolor: '#f4f1ea' }
          }} 
          size="small"
        >
          {/* إذا جاري الرفع تظهر علامة تحميل، وإلا تظهر أيقونة الكاميرا */}
          {uploadingImg ? (
            <CircularProgress size={16} sx={{ color: mainColor }} />
          ) : (
            <CameraAlt fontSize="small" sx={{ color: mainColor, fontSize: 16 }} />
          )}
        </IconButton>
      </label>
    </>
  }
>
  {/* الصورة الشخصية للمستخدم */}
  <Avatar 
    src={userData?.profile_img} 
    sx={{ 
      width: 130, 
      height: 130, 
      border: '4px solid white', 
      boxShadow: '0px 8px 24px rgba(0,0,0,0.15)' 
    }} 
  />
</Badge>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 0.3, 
              alignItems: { xs: 'center', sm: 'flex-start' },
              borderRadius: 2,
              p: { xs: 0, sm: 1 },
              background: { xs: 'none', sm: 'rgba(54, 16, 41, 0.2)' }, 
            }}>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#ffffff', fontFamily: 'Cairo', lineHeight: 1.2, textShadow: '0px 2px 10px rgba(0,0,0,0.8)' }}>
                {userData?.name }
              </Typography>

              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255,255,255,0.95)', 
                  fontFamily: 'Cairo', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.8, 
                  flexDirection: 'row',
                  textShadow: '0px 1px 5px rgba(0,0,0,0.8)'
                }}
              >
                <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, bgcolor: '#4caf50', borderRadius: '50%' }} />
                {userData?.nickname }
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Cairo', fontSize: 14, textShadow: '0px 1px 4px rgba(0,0,0,0.8)' }}>
                  متابعين
                </Typography>
                <Typography sx={{ color: '#ffffff', fontWeight: 'bold', fontFamily: 'Cairo', fontSize: 15, textShadow: '0px 1px 4px rgba(0,0,0,0.8)' }}>
                  {followers.length }
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* --- محتوى التبويبات --- */}
      <Container maxWidth="lg" sx={{ mt: 10, pb: 8 }}>
        <Paper sx={{ borderRadius: 3, mb: 4, border: '3px solid #602134', bgcolor:'#f4f1ea'}}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            textColor="inherit" 
            indicatorColor="none"
            sx={{
              '& .MuiTab-root': { 
                fontFamily: 'Cairo', 
                fontWeight: 'bold', 
                minWidth: 100,
              },
              '& .Mui-selected': { 
                color: '#602134 !important'
              },
              '& .MuiTabs-indicator': { 
                bgcolor: '#f4f1ea' 
              }
            }}
          >
            <Tab icon={<Favorite/>} label="المفضلة" />
            <Tab icon={<People />} label="المتابعون" />
            <Tab icon={<PersonAdd />} label="أتابعهم" />
            <Tab icon={<Lightbulb />} label="اقتراحاتي" />
            <Tab icon={<Edit />} label="تقديم اقتراح" />
            <Tab icon={<Assessment />} label="إحصائياتي" />
          </Tabs>
        </Paper>

        {tabLoading ? (
          <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress sx={{ color: mainColor }} /></Box>
        ) : (
          <Box>
            {/* 0. المكتبة المفضلة */}
            {tabValue === 0 && (
              <Grid container spacing={2}>
                {favorites.length > 0 ? favorites.map(fav => (
                  <Grid item xs={12} sm={6} md={4} key={fav.id}>
                    <BookCard 
                      book={{
                        ...fav.book, 
                        cover_img: fav.book.cover_img?.startsWith('http') 
                          ? fav.book.cover_img 
                          : `${API_URL}/books/images/${fav.book.cover_img?.replace(/^\//, '')}`
                      }}      
                      mainColor={mainColor} 
                      isFavorite={true}
                      onToggleFavorite={() => handleRemoveFavorite(fav.book.id)} 
                    />
                  </Grid>
                )) : (
                  <Typography sx={{ p: 5, textAlign: 'center', width: '100%', fontFamily: 'Cairo' }}>
                    المكتبة فارغة
                  </Typography>
                )}
              </Grid>
            )}

            {/* 1. قسم المتابعون */}
            {tabValue === 1 && (
              <Grid container spacing={1.5} direction="column">
                {(Array.isArray(followers) ? followers : []).map((userItem, index) => {
                  const targetUser = userItem.follower || userItem.user || userItem;
                  return (
                    <Grid item xs={12} key={targetUser.id || index}>
                      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 3 }}>
                        <Avatar src={targetUser.profile_img || targetUser.avatar || ''} />
                        <Typography sx={{ fontFamily: 'Cairo', fontWeight: 500 }}>
                          {targetUser.name || "مستخدم بدون اسم"}
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
                {(Array.isArray(followers) ? followers : []).length === 0 && (
                  <Typography sx={{ fontFamily: 'Cairo', width: '100%', textAlign: 'center', mt: 4, color: 'gray' }}>
                    لا يوجد متابعون حالياً
                  </Typography>
                )}
              </Grid>
            )}

            {/* 2. قسم أتابعهم */}
            {tabValue === 2 && (
              <Grid container spacing={1.5} direction="column">
                {(Array.isArray(following) ? following : []).map((userItem, index) => {
                  const targetUser = userItem.followed || userItem.user || userItem;
                  return (
                    <Grid item xs={12} key={targetUser.id || index}>
                      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 3, }}>
                        <Avatar src={targetUser.profile_img || targetUser.avatar || ''} />
                        <Typography sx={{ fontFamily: 'Cairo', fontWeight: 500 }}>
                          {targetUser.name || "مستخدم بدون اسم"}
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
                {(Array.isArray(following) ? following : []).length === 0 && (
                  <Typography sx={{ fontFamily: 'Cairo', width: '100%', textAlign: 'center', mt: 4, color: 'gray' }}>
                    لا تتابع أحداً حالياً
                  </Typography>
                )}
              </Grid>
            )}

            {/* 3. اقتراحاتي */}
            {tabValue === 3 && (
              <Grid container spacing={2}>
                {suggestions.length > 0 ? suggestions.map(s => (
                  <Grid item xs={12} key={s.id}>
                    <Paper sx={{ p: 2, borderRadius: 3, borderRight: `5px solid ${mainColor}` }}>
                      <Typography variant="h6" sx={{ fontFamily: 'Cairo' }}>{s.title}</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Cairo' }}>المؤلف: {s.author}</Typography>
                      <Typography variant="caption" sx={{ color: mainColor, fontWeight: 'bold' }}>الحالة: {s.status}</Typography>
                    </Paper>
                  </Grid>
                )) : <Typography sx={{ p: 5, textAlign: 'center', width: '100%' }}>لا توجد اقتراحات سابقة</Typography>}
              </Grid>
            )}

            {/* 4. تقديم اقتراح */}
            {tabValue === 4 && (
              <Paper sx={{ p: 4, borderRadius: 4, maxWidth: 600, mx: 'auto' , border: '3px solid #602134', bgcolor: '#f4f1ea'}}>
                <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', fontFamily: 'Cairo' }}>اقتراح كتاب جديد</Typography>
                <TextField label="اسم الكتاب" fullWidth sx={{ mb: 2 }} value={suggestForm.title} onChange={e => setSuggestForm({ ...suggestForm, title: e.target.value })} />
                <TextField label="المؤلف" fullWidth sx={{ mb: 2 }} value={suggestForm.author} onChange={e => setSuggestForm({ ...suggestForm, author: e.target.value })} />
                <TextField label="لماذا تقترحه؟" multiline rows={3} fullWidth sx={{ mb: 3 }} value={suggestForm.description} onChange={e => setSuggestForm({ ...suggestForm, description: e.target.value })} />
                <Button variant="contained" fullWidth onClick={handleSendSuggestion} sx={{ bgcolor: mainColor, py: 1.5, fontFamily: 'Cairo' }}>إرسال الاقتراح</Button>
              </Paper>
            )}

            {/* 5. الإحصائيات ومجموعات الكتب */}
            {tabValue === 5 && (
              <Box sx={{ width: '100%' }}>
                {loadingStats ? (
                  <Typography sx={{ fontFamily: 'Cairo', textAlign: 'center', py: 5, color: mainColor }}>
                    جاري جلب إحصائيات مكتبتكِ وعرض الكتب...
                  </Typography>
                ) : (
                  <Box>
                    <Grid container spacing={3} sx={{ mb: 6 }}>
                      {[
                        { label: "تمت قراءته", count: (bookListData.finished || []).length, color: '#1565C0' },
                        { label: "يقرأ الآن", count: (bookListData.reading || []).length, color: '#E65100' },
                        { label: 'أرغب بقراءته', count: (bookListData.wantToRead || []).length, color: '#C2185B' }
                      ].map((section, i) => (
                        <Grid item xs={12} sm={4} key={i}>
                          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 4, borderBottom: `5px solid ${section.color}` }}>
                            <Typography variant="h3" fontWeight="bold" color={section.color}>
                              {section.count}
                            </Typography>
                            <Typography sx={{ fontFamily: 'Cairo', mt: 1, fontWeight: 'bold', color: '#555' }}>
                              {section.label}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>

                    {[
                      { id: 'finished', title: "الكتب التي تمت قراءتها", books: bookListData.finished || [], color: '#1565C0' },
                      { id: 'reading', title: "الكتب الحالية (يقرأ الآن)", books: bookListData.reading || [], color: '#E65100' },
                      { id: 'wantToRead', title: "كتب أرغب بقراءتها", books: bookListData.wantToRead || [], color: '#C2185B' }
                    ].map((section, idx) => {
                      const isExpanded = expandedSections[section.id];
                      const displayedBooks = isExpanded ? section.books : section.books.slice(0, 3);

                      return (
                        <Box key={section.id} sx={{ mb: 6 }}>
                          <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 700, mb: 3, color: section.color, borderRight: `4px solid ${section.color}`, pr: 1.5 }}>
                            {section.title} ({(section.books || []).length})
                          </Typography>

                          {(!section.books || section.books.length === 0) ? (
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#999', px: 2, mb: 4 }}>
                              لا توجد كتب في هذه القائمة حالياً.
                            </Typography>
                          ) : (
                            <Box>
                              <Grid container spacing={3}>
                                {displayedBooks.map((item) => {
                                  const book = item.book || item; 
                                  if (!book) return null;

                                  const rawImage = book.cover_img || book.cover_image || book.image || "";

                                  let finalCover = "";
                                  if (rawImage.startsWith('http')) {
                                    finalCover = rawImage;
                                  } else {
                                    const cleanPath = rawImage.replace(/^\//, '');
                                    if (cleanPath.startsWith('books/images/')) {
                                      finalCover = `${API_URL}/${cleanPath}`;
                                    } else {
                                      finalCover = `${API_URL}/books/images/${cleanPath}`;
                                    }
                                  }

                                  const preparedBook = { ...book, cover_img: finalCover };

                                  return (
                                    <BookCard 
                                      key={item.id || book.id}
                                      book={preparedBook}
                                      mainColor={mainColor}
                                      onToggleFavorite={() => {}} 
                                    />
                                  );
                                })}
                              </Grid>

                              {section.books.length > 3 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                  <Button
                                    variant="outlined"
                                    onClick={() => setExpandedSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                                    sx={{
                                      fontFamily: 'Cairo', color: section.color, borderColor: section.color, borderRadius: 2, px: 4,
                                      '&:hover': { borderColor: section.color, bgcolor: `${section.color}08` }
                                    }}
                                  >
                                    {isExpanded ? "عرض أقل" : "عرض المزيد..."}
                                  </Button>
                                </Box>
                              )}
                            </Box>
                          )}
                          {idx < 2 && <Divider sx={{ mt: 5, opacity: 0.4 }} />}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            )}

          </Box>
        )}
      </Container>
      
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.color} sx={{ width: '100%', fontFamily: 'Cairo' }}>{snack.message}</Alert>
      </Snackbar>

{/* ================= القائمة الصغيرة مع إمكانية تعديل الألوان الكاملة ================= */}
      <Menu
        anchorEl={anchorEl}
        open={openSettings}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }} 
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        PaperProps={{ 
          sx: { 
            borderRadius: 3, 
            minWidth: 180, 
            p: 0.5, 
            bgcolor: '#f4f1ea', // لون خلفية القائمة (كريمي)
            border: '1px solid #602134', // لون إطار القائمة (برغندي)
            direction: 'rtl'
          } 
        }}
      >
        {/* 1. خيار تعديل كلمة المرور */}
        <MenuItem 
          onClick={() => { handleMenuClose(); setOpenPasswordDialog(true); }} 
          sx={{ 
            fontFamily: 'Cairo', 
            color: '#602134', // 🎨 لون النص هنا (برغندي)
            fontWeight: 600, 
            borderRadius: '8px', 
            mb: 0.5,
            '&:hover': { bgcolor: 'rgba(96, 33, 52, 0.08)' } // لون التأثير عند تمرير الماوس
          }}
        >
          <ListItemIcon>
            <Key fontSize="small" sx={{ color: '#602134', ml: 1 }} /> {/* 🎨 لون الأيقونة */}
          </ListItemIcon>
          تعديل كلمة المرور
        </MenuItem>

        <Divider sx={{ borderColor: 'rgba(96, 33, 52, 0.15)' }} />

        {/* 2. خيار حذف الحساب نهائياً */}
        <MenuItem 
          onClick={() => { handleMenuClose(); setOpenDeleteAccDialog(true); }} 
          sx={{ 
            fontFamily: 'Cairo', 
            color: '#602134', // 🎨 لون النص (أحمر افتراضي للتحذير، فيكِ تغيريه مثلاً لـ #602134)
            fontWeight: 600, 
            borderRadius: '8px', 
            mt: 0.5,
            '&:hover': { bgcolor: 'rgba(96, 33, 52, 0.08)' }
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: '#602134', ml: 1 }} /> {/* 🎨 لون الأيقونة */}
          </ListItemIcon>
          حذف الحساب نهائياً
        </MenuItem>

        <Divider sx={{ borderColor: 'rgba(96, 33, 52, 0.15)' }} />

        {/* 3. خيار تسجيل الخروج */}
        <MenuItem 
          onClick={handleConfirmOpen} 
          sx={{ 
            fontFamily: 'Cairo', 
            color: '#602134', // 🎨 غيرتلك لون النص لبرغندي ليطابق الثيم بدلاً من الأحمر الافتراضي بالصورة
            fontWeight: 600, 
            borderRadius: '8px',
            '&:hover': { bgcolor: 'rgba(96, 33, 52, 0.08)' }
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: '#602134', ml: 1 }} /> {/* 🎨 لون الأيقونة مبرغند */}
          </ListItemIcon>
          تسجيل الخروج
        </MenuItem>
      </Menu>

      {/* ================= واجهات الـ Dialogs المصممة بثيم المنصة (البرغندي والكريمي) ================= */}

      {/* 1. نافذة تأكيد تسجيل الخروج */}
      <Dialog
        open={openConfirm}
        onClose={handleConfirmClose}
        dir="rtl"
        PaperProps={{ sx: { borderRadius: '24px', bgcolor: '#f4f1ea', border: '3px solid #602134', p: 1, maxWidth: '400px', width: '100%' } }}
      >
        <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 800, textAlign: 'right', color: '#602134' }}>
          تأكيد تسجيل الخروج
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: 'Cairo', textAlign: 'right', color: '#444' }}>
            هل أنتِ متأكدة من أنكِ تريدين تسجيل الخروج من حسابكِ والعودة للصفحة الرئيسية؟
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'flex-start', gap: 1 }}>
          <Button onClick={handleConfirmClose} variant="outlined" sx={{ fontFamily: 'Cairo', color: '#602134', borderColor: '#602134', borderRadius: '12px' }}>
            إلغاء
          </Button>
          <Button onClick={handleLogout} variant="contained" sx={{ fontFamily: 'Cairo', bgcolor: '#602134', borderRadius: '12px', '&:hover': { bgcolor: '#4a1928' } }}>
            تسجيل الخروج
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2. نافذة تعديل كلمة المرور المنبثقة */}
      <Dialog 
        open={openPasswordDialog} 
        onClose={() => setOpenPasswordDialog(false)} 
        dir="rtl"
        PaperProps={{ sx: { borderRadius: '24px', bgcolor: '#f4f1ea', border: '3px solid #602134', p: 1, maxWidth: '400px', width: '100%' } }}
      >
        <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 800, textAlign: 'right', color: '#602134' }}>
          تحديث كلمة المرور
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1.5 }}>
          <TextField
            label="كلمة المرور القديمة" type="password" fullWidth size="small"
            value={passwordData.old_password}
            onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
            inputProps={{ style: { textAlign: 'right', direction: 'rtl' } }}
            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
          />
          <TextField
            label="كلمة المرور الجديدة" type="password" fullWidth size="small"
            value={passwordData.password}
            onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}
            inputProps={{ style: { textAlign: 'right', direction: 'rtl' } }}
            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
          />
          <TextField
            label="تأكيد كلمة المرور الجديدة" type="password" fullWidth size="small"
            value={passwordData.password_confirmation}
            onChange={(e) => setPasswordData({...passwordData, password_confirmation: e.target.value})}
            inputProps={{ style: { textAlign: 'right', direction: 'rtl' } }}
            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1, justifyContent: 'flex-start' }}>
          <Button variant="contained" onClick={handleUpdatePassword} sx={{ fontFamily: 'Cairo', bgcolor: '#602134', borderRadius: '12px', '&:hover': { bgcolor: '#4a1928' } }}>
            حفظ التعديل
          </Button>
          <Button variant="outlined" onClick={() => setOpenPasswordDialog(false)} sx={{ fontFamily: 'Cairo', color: '#602134', borderColor: '#602134', borderRadius: '12px' }}>
            إلغاء
          </Button>
        </DialogActions>
      </Dialog>

      {/* 3. نافذة تأكيد حذف الحساب نهائياً */}
      <Dialog 
        open={openDeleteAccDialog} 
        onClose={() => setOpenDeleteAccDialog(false)} 
        dir="rtl"
        PaperProps={{ sx: { borderRadius: '24px', bgcolor: '#f4f1ea', border: '3px solid #602134', p: 1, maxWidth: '420px', width: '100%' } }}
      >
        <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 800, textAlign: 'right', color: '#602134' }}>
          حذف الحساب بشكل نهائي!
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: 'Cairo', textAlign: 'right', color: '#444', lineHeight: 1.6 }}>
            تحذير: هل أنتِ متأكدة من رغبتكِ في حذف حسابكِ من منصة جُلساء؟ هذا الإجراء سيقوم بحذف جميع تعليقاتكِ، ومراجعاتكِ، وبياناتكِ الشخصية فوراً ولا يمكن استرجاع الحساب مطلقاً.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1, justifyContent: 'flex-start' }}>
          <Button variant="contained" color="error" onClick={handleDeleteAccount} sx={{ fontFamily: 'Cairo', borderRadius: '12px', bgcolor: '#602134', '&:hover': { bgcolor: '#4a1a2a' } }}>
            نعم، احذف حسابي
          </Button>
          <Button variant="outlined" onClick={() => setOpenDeleteAccDialog(false)} sx={{ fontFamily: 'Cairo', color: '#602134', borderColor: '#602134', borderRadius: '12px' }}>
            تراجع
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default ProfilePage;