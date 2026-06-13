import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Paper, Avatar, Grid, Button,
  Tabs, Tab, IconButton, Badge, Snackbar, TextField, CircularProgress, Alert,
  Menu, MenuItem, Divider, ListItemIcon
} from '@mui/material';
import { 
  Edit , People, PersonAdd, Lightbulb, Assessment, 
  Settings, Logout, Lock, Save, CameraAlt 
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
  
  // 2. بيانات التبويبات
  const [favorites, setFavorites] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  // حالة لتتبع أي الأقسام تم الضغط فيها على "عرض المزيد"
const [expandedSections, setExpandedSections] = useState({});
  // 💡 الحالات الجديدة لتخزين مصفوفات الكتب كاملة لعرضها أسفل كروت الإحصائيات
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

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const openSettings = Boolean(anchorEl);
const navigate = useNavigate(); 

  // جلب البيانات عند التحميل الأول
useEffect(() => {
  const fetchInitialData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/info`, config);
      setUserData(res.data.data);
      setStats(res.data.stats);
      
      // 💡 تحميل المفضلة كافتراضي للتبويب رقم 0
      const favRes = await axios.get(`${API_URL}/api/favorites`, config);
      setFavorites(favRes.data.data);

      // 💡 جلب المتابعين ومن تتابعيهم فوراً لتظهر الأرقام تحت الاسم مباشرة دون انتظار الضغط على التبويب
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
        // 💾 الاحتفاظ بالمصفوفات كاملة هنا لعرض محتواها لاحقاً
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

  // التحكم في التبويبات وجلب بيانات كل تبويب عند النقر
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
    
    // 1. إرسال طلب للباك إند لحذف التوكن الحالي
    await axios.post(`${API_URL}/api/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  } catch (error) {
    console.error("خطأ أثناء تسجيل الخروج من الخادم:", error);
  } finally {
    // 2. حذف التوكن والمعلومات من المتصفح بأي حال من الأحوال
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // إذا كنتِ تخزنين بيانات المستخدم هنا
    
    // 3. توجيه المستخدم فوراً إلى الصفحة الرئيسية للزوار
    navigate('/'); 
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
// دالة لإزالة الكتاب من المفضلة متوافقة مع الباك-إند الخاص بكِ
const handleRemoveFavorite = async (bookId) => {
  try {
    const token = localStorage.getItem('token');
    
    // استدعاء رابط الحذف باستخدام دالة axios.delete وتمرير الـ bookId في الرابط
    const response = await axios.delete(`${API_URL}/api/delete_favorites/${bookId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (response.data.success) {
      // تحديث الواجهة فوراً بحذف الكتاب من الـ State لكي يختفي من الشاشة تلقائياً
      setFavorites(prevFavorites => prevFavorites.filter(fav => fav.book_id !== bookId && fav.book.id !== bookId));
      
      // إذا كان عندكِ سناك بار أو رسائل تنبيه (تأكدي من المسمى عندكِ مثلاً setOpenSnack أو حسب الكود)
      // setSnack({ open: true, message: "تم حذف الكتاب من المفضلة بنجاح", color: "success" });
    }
  } catch (err) {
    console.error("خطأ أثناء إزالة الكتاب من المفضلة", err);
    // alert("فشل إزالة الكتاب، حاول مجدداً");
  }
};
  return (
    <Box sx={{ bgcolor: '#E4DED2', minHeight: '100vh', direction: 'rtl' }}>
      
{/* --- الهيدر (الغلاف المعتمد على صورتكِ الجديدة مع المنحنى) --- */}
<Box 
  sx={{ 
    height: 380, 
backgroundImage: `url(/images/header-bg.jpg)`, // 💡 يقرأ من مجلد public تلقائياً
   backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative', 
    width: '100%',
    overflow: 'hidden',
    // طبقة تعتيم برغندية ناعمة لحماية وضوح النصوص البيضاء فوق النقوش
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(66, 11, 31, 0.3)', // تدرج برغندي خفيف شفاف بنسبة 30%
      zIndex: 1
    }
  }}
>
{/* 🌊 رسمة المنحنى الانسيابي (SVG) - يطفو فوق الصورة وتحت كرت الحساب مع حد ذهبي فخم */}
<Box
  component="svg"
  viewBox="0 0 1440 320"
  preserveAspectRatio="none"
  sx={{
    position: 'absolute',
    bottom: -2, // يلتصق بأسفل الغلاف تماماً
    left: 0,
    width: '100%',
    height: '110px', 
    zIndex: 2, // يضمن طفوه فوق صورة الغلاف وتحت محتوى الحساب
  }}
>
  {/* 1️⃣ المنحنى الأساسي باللون البيج (يُرسم أولاً في الخلفية) */}
  <path
    fill="#E4DED2" // نفس لون خلفية صفحتك البيج تماماً ليعطي إيحاء القص والاندماج
    fillOpacity="1"
    d="M0,224L120,208C240,192,480,160,720,176C960,192,1200,256,1320,288L1440,320L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
  ></path>

  {/* 2️⃣ 💡 الخط الذهبي: يُرسم ثانياً ليركب بدقة فوق الحافة العلوية للمنحنى البيج ويظهر بوضوح */}
  <path
    d="M0,224L120,208C240,192,480,160,720,176C960,192,1200,256,1320,288L1440,320"
    fill="none" // نتركه فارغاً لأننا نريد خطاً (Border) فقط وليس ملء مساحة
    stroke="#D4AF37" // درجة اللون الذهبي الملكي الميتاليك
    strokeWidth="10" // سماكة الخط (5 بكسل لتكون واضحة وأنيقة)
    strokeLinecap="round" // تجعل أطراف الخط دائرية وناعمة عند الحواف
  ></path>
</Box>

  <Container maxWidth="lg" sx={{ position: 'relative', height: '100%', zIndex: 4 }}>
    
    {/* زر الإعدادات */}
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

    {/* الحاضن المرن للمعلومات الشخصية (الاسم والصورة والعداد) */}
<Box sx={{ 
  position: 'absolute', 
  bottom: 40, // رفعناه قليلاً ليتناسق مع المنحنى
  display: 'flex', 
  alignItems: 'center', 
  gap: 3, // المسافة بين الصورة والنصوص
  width: 'auto',
  // تثبيت الحاوية في جهة اليمين (مع إزاحة مرنة عن الحافة لكي لا تلتصق تماماً)
  right: { xs: 'auto', sm: 60 },  
  left: { xs: '50%', sm: 'auto' }, 
  transform: { xs: 'translateX(-50%)', sm: 'none' },
  flexDirection: { xs: 'column', sm: 'row' }, // row تجعل الصورة يمين والنصوص يسارها فوراً
  zIndex: 5 
}}>
  
  {/* 1️⃣ الصورة الشخصية (أصبحت الآن أقصى اليمين) */}
  <Badge
    overlap="circular"
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
    badgeContent={
      <IconButton sx={{ bgcolor: 'white', border: '1px solid #ddd', width: 32, height: 32 }} size="small">
        <CameraAlt fontSize="small" sx={{ color: mainColor, fontSize: 16 }} />
      </IconButton>
    }
  >
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

  {/* 2️⃣ تفاصيل النصوص - تأتي مباشرة على يسار الصورة ومحاذاتها لليمين (flex-start باللغة العربية) */}
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 0.3, 
    alignItems: { xs: 'center', sm: 'flex-start' },
    // إضافة تظليل خلفية خفيف جداً وضبابي خلف النص فقط ليصبح مقروءاً حتى لو تداخل مع كلمات الغلاف
    borderRadius: 2,
    p: { xs: 0, sm: 1 },
    background: { xs: 'none', sm: 'rgba(54, 16, 41, 0.2)' }, // تعتيم برغندي ناعم جداً خلف الحروف
    backdropFilter: { xs: 'none', sm: 'blur(4px)' }
  }}>
    
    <Typography variant="h4" fontWeight="bold" sx={{ color: '#ffffff', fontFamily: 'Cairo', lineHeight: 1.2, textShadow: '0px 2px 10px rgba(0,0,0,0.8)' }}>
      {userData?.name || "hanan hasaba"}
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
      {userData?.nickname || "قارئ نشيط"}
    </Typography>

    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
      <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Cairo', fontSize: 14, textShadow: '0px 1px 4px rgba(0,0,0,0.8)' }}>
        متابعين
      </Typography>
      <Typography sx={{ color: '#ffffff', fontWeight: 'bold', fontFamily: 'Cairo', fontSize: 15, textShadow: '0px 1px 4px rgba(0,0,0,0.8)' }}>
        {followers.length || 5}
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
          // 💡 هنا التعديل السحري: نمرر الدالة لكي يعرف الكرت ماذا يفعل عند الضغط على القلب
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
              <Paper sx={{ p: 4, borderRadius: 4, maxWidth: 600, mx: 'auto' }}>
                <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', fontFamily: 'Cairo' }}>اقتراح كتاب جديد</Typography>
                <TextField label="اسم الكتاب" fullWidth sx={{ mb: 2 }} value={suggestForm.title} onChange={e => setSuggestForm({ ...suggestForm, title: e.target.value })} />
                <TextField label="المؤلف" fullWidth sx={{ mb: 2 }} value={suggestForm.author} onChange={e => setSuggestForm({ ...suggestForm, author: e.target.value })} />
                <TextField label="لماذا تقترحه؟" multiline rows={3} fullWidth sx={{ mb: 3 }} value={suggestForm.description} onChange={e => setSuggestForm({ ...suggestForm, description: e.target.value })} />
                <Button variant="contained" fullWidth onClick={handleSendSuggestion} sx={{ bgcolor: mainColor, py: 1.5, fontFamily: 'Cairo' }}>إرسال الاقتراح</Button>
              </Paper>
            )}

            {tabValue === 5 && (
  <Box sx={{ width: '100%' }}>
    {loadingStats ? (
      <Typography sx={{ fontFamily: 'Cairo', textAlign: 'center', py: 5, color: mainColor }}>
        جاري جلب إحصائيات مكتبتكِ وعرض الكتب...
      </Typography>
    ) : (
      <Box>
        {/* صف الكروت الثلاثة العلوي للإحصائيات الأرقام */}
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

        {/* عرض مجموعات الكتب الفعلية مقسمة بالتتابع لتبدو متناسقة */}
        {[
          { id: 'finished', title: "الكتب التي تمت قراءتها", books: bookListData.finished || [], color: '#1565C0' },
          { id: 'reading', title: "الكتب الحالية (يقرأ الآن)", books: bookListData.reading || [], color: '#E65100' },
          { id: 'wantToRead', title: "كتب أرغب بقراءتها", books: bookListData.wantToRead || [], color: '#C2185B' }
        ].map((section, idx) => {
          // هل المستخدم ضغط "عرض المزيد" لهذا القسم بالذات؟
          const isExpanded = expandedSections[section.id];
          // إذا مش مفتوح، اعرضي أول 3 كتب فقط، وإذا مفتوح اعرضي كل الكتب
          const displayedBooks = isExpanded ? section.books : section.books.slice(0, 3);

          return (
            <Box key={section.id} sx={{ mb: 6 }}>
              {/* عنوان القسم */}
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

                      const preparedBook = {
                        ...book,
                        cover_img: finalCover 
                      };

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

                  {/* زر عرض المزيد / عرض أقل يظهر فقط إذا كان عدد كتب القسم أكبر من 3 */}
                  {section.books.length > 3 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setExpandedSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                        sx={{
                          fontFamily: 'Cairo',
                          color: section.color,
                          borderColor: section.color,
                          borderRadius: 2,
                          px: 4,
                          '&:hover': {
                            borderColor: section.color,
                            bgcolor: `${section.color}08` // خلفية شفافة خفيفة بلون القسم عند الحوم
                          }
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

            {/* 6. تعديل الحساب */}
         {tabValue === 6 && (
  <Paper sx={{ p: 4, borderRadius: 4, maxWidth: 800, mx: 'auto' }}>
    <Typography variant="h5" sx={{ mb: 4, fontFamily: 'Cairo', fontWeight: 'bold' }}>
      تعديل المعلومات الشخصية
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}><TextField label="الاسم" fullWidth defaultValue={userData?.name} /></Grid>
      <Grid item xs={12} sm={6}><TextField label="اسم المستخدم" fullWidth defaultValue={userData?.nickname} /></Grid>
      <Grid item xs={12}><TextField label="البريد الإلكتروني" fullWidth defaultValue={userData?.email} /></Grid>
      
      {/* صف الأزرار السفلي */}
      <Grid item xs={12} sx={{ display: 'flex', gap: 2, mt: 2 }}>
        {/* زر حفظ التعديلات */}
        <Button 
          variant="contained" 
          startIcon={<Save />} 
          sx={{ bgcolor: mainColor, px: 4, py: 1.2, fontFamily: 'Cairo', '&:hover': { bgcolor: mainColor } }}
        >
          حفظ التعديلات
        </Button>

        {/* 💡 زر تسجيل الخروج الجديد المربوط بالدالة */}
        <Button 
          variant="outlined" 
          color="error"
          onClick={handleLogout} // استدعاء الدالة عند الضغط
          sx={{ px: 4, py: 1.2, fontFamily: 'Cairo', fontWeight: 'bold' }}
        >
          تسجيل الخروج
        </Button>
      </Grid>
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