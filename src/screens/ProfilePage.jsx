import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Paper, Avatar, Grid, Button,
  Tabs, Tab, IconButton, Badge, Snackbar, TextField, CircularProgress, Alert,
  Menu, MenuItem, Divider, ListItemIcon
} from '@mui/material';
import { 
  Edit, Book, People, PersonAdd, Lightbulb, Assessment, 
  Settings, Logout, Lock, Notifications, Save, CameraAlt 
} from '@mui/icons-material';
import axios from 'axios';
import BookCard from './BookCard';

const API_URL = "http://localhost:8000";
const mainColor = '#541029';

const ProfilePage = () => {
  // 1. الحالات الأساسية
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  
  // 2. بيانات التبويبات
  const [favorites, setFavorites] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  
  // 3. حالات القوائم والنماذج
  const [anchorEl, setAnchorEl] = useState(null);
  const [suggestForm, setSuggestForm] = useState({ title: "", author: "", description: "", related_book_id: "" });
  const [snack, setSnack] = useState({ open: false, message: "", color: "success" });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const openSettings = Boolean(anchorEl);

  // جلب البيانات عند التحميل الأول
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/info`, config);
        setUserData(res.data.data);
        setStats(res.data.stats);
        
        // تحميل المفضلة كافتراضي للتبويب رقم 0
        const favRes = await axios.get(`${API_URL}/api/favorites`, config);
        setFavorites(favRes.data.data);
      } catch (err) {
        console.error("Error fetching base info", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // التحكم في التبويبات وجلب بيانات كل تبويب عند النقر
  const handleTabChange = async (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 4 || newValue === 5 || newValue === 6) return; // تبويبات لا تحتاج جلب بيانات فورية

    setTabLoading(true);
    try {
      let endpoint = "";
      if (newValue === 0) endpoint = "/api/favorites";
      else if (newValue === 1) endpoint = "/api/followers";
      else if (newValue === 2) endpoint = "/api/following";
      else if (newValue === 3) endpoint = "/api/suggestions/mine";

      if (endpoint) {
        const res = await axios.get(`${API_URL}${endpoint}`, config);  
  // 💡 أضف هذين السطرين لمراقبة البيانات القادمة
  if (newValue === 1) console.log("بيانات المتابعين من السيرفر:", res.data);
  if (newValue === 2) console.log("بيانات الذين أتابعهم من السيرفر:", res.data);
       // 💡 استبدل الجزء الخاص بالتخزين داخل دالة handleTabChange لتصبح هكذا:
if (newValue === 0) setFavorites(res.data.data);
else if (newValue === 1) setFollowers(res.data.data.followers || res.data.data); // استخراج المصفوفة مباشرة
else if (newValue === 2) setFollowing(res.data.data.following || res.data.data); // استخراج المصفوفة مباشرة
else if (newValue === 3) setSuggestions(res.data.data);
      }
    } catch (err) {
      console.error("Error loading tab content", err);
    } finally {
      setTabLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
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

  return (
    <Box sx={{ bgcolor: '#F8F9FA', minHeight: '100vh', direction: 'rtl' }}>
      
      {/* --- الهيدر (الغلاف وصورة الحساب) --- */}
      <Box sx={{ height: 220, background: `linear-gradient(45deg, ${mainColor} 30%, #821c3e 90%)`, position: 'relative' }}>
        <Container maxWidth="lg" sx={{ position: 'relative', height: '100%' }}>
          
          {/* زر الإعدادات العلوي */}
          <IconButton 
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ position: 'absolute', top: 20, left: 20, bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
          >
            <Settings sx={{ color: 'white' }} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={openSettings}
            onClose={() => setAnchorEl(null)}
            PaperProps={{ sx: { borderRadius: 2, minWidth: 200, mt: 1.5, boxShadow: 3 } }}
          >
            <MenuItem onClick={() => { setTabValue(6); setAnchorEl(null); }}>
              <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
              <Typography sx={{ fontFamily: 'Cairo' }}>تعديل الملف الشخصي</Typography>
            </MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>
              <ListItemIcon><Lock fontSize="small" /></ListItemIcon>
              <Typography sx={{ fontFamily: 'Cairo' }}>تغيير كلمة المرور</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
              <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>تسجيل الخروج</Typography>
            </MenuItem>
          </Menu>

          <Box sx={{ position: 'absolute', bottom: -50, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              badgeContent={<IconButton sx={{ bgcolor: 'white', border: '1px solid #ddd' }} size="small"><CameraAlt fontSize="small" sx={{ color: mainColor }} /></IconButton>}
            >
              <Avatar src={userData?.profile_img} sx={{ width: 130, height: 130, border: '5px solid white', boxShadow: 3 }} />
            </Badge>
            <Box sx={{ mb: 1 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: 'white', fontFamily: 'Cairo' }}>{userData?.name}</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Cairo' }}>@{userData?.nickname}</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* --- محتوى التبويبات --- */}
      <Container maxWidth="lg" sx={{ mt: 10, pb: 8 }}>
        <Paper sx={{ borderRadius: 3, mb: 4, overflow: 'hidden' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            sx={{
              '& .MuiTab-root': { fontFamily: 'Cairo', fontWeight: 'bold', minWidth: 100 },
              '& .Mui-selected': { color: mainColor },
              '& .MuiTabs-indicator': { bgcolor: mainColor }
            }}
          >
            <Tab icon={<Book />} label="المكتبة" />          {/* 0 */}
            <Tab icon={<People />} label="المتابعون" />      {/* 1 */}
            <Tab icon={<PersonAdd />} label="أتابعهم" />       {/* 2 */}
            <Tab icon={<Lightbulb />} label="اقتراحاتي" />     {/* 3 */}
            <Tab icon={<Edit />} label="تقديم اقتراح" />      {/* 4 */}
            <Tab icon={<Assessment />} label="إحصائياتي" />    {/* 5 */}
          </Tabs>
        </Paper>

        {tabLoading ? (
          <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress sx={{ color: mainColor }} /></Box>
        ) : (
          <Box>
            {/* 0. المكتبة */}
            {tabValue === 0 && (
              <Grid container spacing={2}>
                {favorites.length > 0 ? favorites.map(fav => (
                  <Grid item xs={12} sm={6} md={4} key={fav.id}>
                    <BookCard 
                      book={{...fav.book, cover_image: fav.book.cover_image?.startsWith('http') ? fav.book.cover_image : `${API_URL}/${fav.book.cover_image}`}}
                      mainColor={mainColor} isFavorite={true}
                    />
                  </Grid>
                )) : <Typography sx={{ p: 5, textAlign: 'center', width: '100%', fontFamily: 'Cairo' }}>المكتبة فارغة</Typography>}
              </Grid>
            )}

            {/* 1 & 2. المتابعة */}
{/* --- قسم المتابعون (Tab 1) - عرض عمودي --- */}
{tabValue === 1 && (
  <Grid container spacing={1.5} direction="column"> {/* تم تقليل المسافات وجعل الاتجاه عمودي */}
    {(Array.isArray(followers) ? followers : []).map((userItem, index) => {
      const targetUser = userItem.follower || userItem.user || userItem;
      return (
        // 💡 التعديل هنا: xs={12} دائماً لتأخذ العرض بالكامل
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

{/* --- قسم أتابعهم (Tab 2) - عرض عمودي --- */}
{tabValue === 2 && (
  <Grid container spacing={1.5} direction="column"> {/* تم تقليل المسافات وجعل الاتجاه عمودي */}
    {(Array.isArray(following) ? following : []).map((userItem, index) => {
      const targetUser = userItem.followed || userItem.user || userItem;
      return (
        // 💡 التعديل هنا: xs={12} دائماً لتأخذ العرض بالكامل
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

    {(Array.isArray(following) ? following : []).length === 0 && (
      <Typography sx={{ fontFamily: 'Cairo', width: '100%', textAlign: 'center', mt: 4, color: 'gray' }}>
        لا تتابع أحداً حالياً
      </Typography>
    )}
  </Grid>
)}

            {/* 3. اقتراحاتي (تم التصحيح) */}
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
              <Paper sx={{ p: 4, borderRadius: 4, maxWidth: 600, mx: 'auto' }}>
                <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', fontFamily: 'Cairo' }}>اقتراح كتاب جديد</Typography>
                <TextField label="اسم الكتاب" fullWidth sx={{ mb: 2 }} value={suggestForm.title} onChange={e => setSuggestForm({ ...suggestForm, title: e.target.value })} />
                <TextField label="المؤلف" fullWidth sx={{ mb: 2 }} value={suggestForm.author} onChange={e => setSuggestForm({ ...suggestForm, author: e.target.value })} />
                <TextField label="لماذا تقترحه؟" multiline rows={3} fullWidth sx={{ mb: 3 }} value={suggestForm.description} onChange={e => setSuggestForm({ ...suggestForm, description: e.target.value })} />
                <Button variant="contained" fullWidth onClick={handleSendSuggestion} sx={{ bgcolor: mainColor, py: 1.5, fontFamily: 'Cairo' }}>إرسال الاقتراح</Button>
              </Paper>
            )}

            {/* 5. الإحصائيات */}
            {tabValue === 5 && (
              <Grid container spacing={3}>
                {[
                  { label: "تمت قراءته", count: stats?.finished_count, color: '#1565C0' },
                  { label: "يقرأ الآن", count: stats?.reading_now_count, color: '#E65100' },
                  { label: "في الانتظار", count: stats?.want_to_read_count, color: '#C2185B' }
                ].map((s, i) => (
                  <Grid item xs={12} sm={4} key={i}>
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, borderBottom: `4px solid ${s.color}` }}>
                      <Typography variant="h3" fontWeight="bold" color={s.color}>{s.count || 0}</Typography>
                      <Typography sx={{ fontFamily: 'Cairo' }}>{s.label}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* 6. تعديل الحساب (يفتح من المنيو) */}
            {tabValue === 6 && (
              <Paper sx={{ p: 4, borderRadius: 4, maxWidth: 800, mx: 'auto' }}>
                <Typography variant="h5" sx={{ mb: 4, fontFamily: 'Cairo', fontWeight: 'bold' }}>تعديل المعلومات الشخصية</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}><TextField label="الاسم" fullWidth defaultValue={userData?.name} /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="اسم المستخدم" fullWidth defaultValue={userData?.nickname} /></Grid>
                  <Grid item xs={12}><TextField label="البريد الإلكتروني" fullWidth defaultValue={userData?.email} /></Grid>
                  <Grid item xs={12}><Button variant="contained" startIcon={<Save />} sx={{ bgcolor: mainColor, px: 4, py: 1.2, fontFamily: 'Cairo' }}>حفظ التعديلات</Button></Grid>
                </Grid>
              </Paper>
            )}
          </Box>
        )}
      </Container>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.color} sx={{ width: '100%', fontFamily: 'Cairo' }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;