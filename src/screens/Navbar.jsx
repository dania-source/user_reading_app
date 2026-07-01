import React, { useState, useEffect } from 'react';
import { 
  AppBar, Container, Toolbar, TextField, InputAdornment, 
  Avatar, IconButton, Box, Button, Dialog, Typography,
  Badge, Menu, MenuItem, List, ListItem, ListItemText, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications'; 
import DoneAllIcon from '@mui/icons-material/DoneAll'; // أيقونة تحديد الكل كمقروء
import { useNavigate } from 'react-router-dom';
import Auth from './Auth'; 
import axios from 'axios'; 

const Navbar = ({ user, mainColor, searchQuery, handleSearch, setUser }) => {
  const navigate = useNavigate();
  const [openAuth, setOpenAuth] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [anchorElNotify, setAnchorElNotify] = useState(null);

  // جلب الإشعارات من الباك إند
// 1. جلب الإشعارات مع طباعة للتأكد من البنية
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.get('http://localhost:8000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        console.log("الأشعارات القادمة من السيرفر بالكامل:", response.data.data);
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error("خطأ في جلب الإشعارات:", error);
    }
  };

  // 2. دالة معالجة واستخراج النص بأمان (تمنع ظهور الإشعار فارغاً)
const getNotificationMessage = (notification) => {
    if (!notification || !notification.data) return 'إشعار جديد';
    
    let parsedData = notification.data;
    
    // 1. إذا كانت البيانات قادمة كـ String JSON، نقوم بفك تشفيرها أولاً
    if (typeof notification.data === 'string') {
      try {
        parsedData = JSON.parse(notification.data);
      } catch (e) {
        return notification.data; // إذا لم يكن JSON، يعود النص كما هو
      }
    }
    
    // 2. الفحص الذكي والمرن لاستخراج النص بناءً على نوع الإشعار:
    // يغطي إشعارات الاقتراحات (message) وإشعارات الألقاب والترقيات (title أو المجموعات المتداخلة)
    return parsedData.message || 
           parsedData.title || 
           parsedData.text || 
           (parsedData.data && typeof parsedData.data === 'object' ? parsedData.data.message : null) ||
           'تم تحديث اللقب الخاص بك بنجاح!';
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleOpenNotifyMenu = (event) => {
    setAnchorElNotify(event.currentTarget);
  };

  const handleCloseNotifyMenu = () => {
    setAnchorElNotify(null);
  };

  // دالة تحديد إشعار واحد كمقروء عند الضغط عليه
 const handleMarkAsRead = async (id) => {
  try {
    const token = localStorage.getItem('token');
    // التعديل: تمرير المعرف في الرابط مباشرة مثل دالة الكل
    const response = await axios.post(`http://localhost:8000/api/all_read/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date() } : n));
    }
  } catch (error) {
    console.error("خطأ في تحديد الإشعار كمقروء:", error);
  }
};

 

// 2. دالة تحديد كــــــــل الإشعارات كمقروءة دفعة واحدة
const handleMarkAllAsRead = async () => {
  try {
    const token = localStorage.getItem('token');
    const unreadNotifications = notifications.filter(n => n.read_at === null);
    
    if (unreadNotifications.length === 0) return;

    // تحديث الحالة محلياً في الفرونت إند فوراً ليشعر المستخدم بالسرعة وسلاسة التصميم
    setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date() })));

    // إرسال الطلبات إلى السيرفر بالتوازي بعد تعديل الرابط
    const promises = unreadNotifications.map(n => 
      axios.post(`http://localhost:8000/api/all_read/${n.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
    );

    await Promise.all(promises);
    
  } catch (error) {
    console.error("خطأ في تحديد الكل كمقروء:", error);
    // في حال حدث خطأ، نعيد جلب البيانات الأصلية للتأكيد
    fetchNotifications();
  }
};

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleAuthSuccess = () => {
    setOpenAuth(false);
    window.location.reload(); 
  };

  // حساب الإشعارات غير المقروءة فقط ليظهر الرقم فوق الجرس
  const unreadCount = notifications.filter(n => n.read_at === null).length;

  return (
    <>
      <AppBar position="fixed" sx={{ background: '#490E22', boxShadow: 'none' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', px: 0, direction: 'rtl' }}>
            
            {/* 1. اليمين: اللوغو والاسم */}
            <Box 
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
              onClick={() => scrollToSection('home-section')}
            >
              <Box
                component="img"
                src="/images/logo.png" 
                alt="لوغو جليس"
                sx={{
                  width: { xs: '40px', md: '80px' }, 
                  height: { xs: '40px', md: '70px' },
                  objectFit: 'contain',
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontFamily: 'Cairo',
                  fontWeight: '900',
                  color: 'white',
                  display: { xs: 'none', sm: 'block' },
                  filter: 'drop-shadow(0px 2px 8px rgba(255, 255, 255, 0.3))'
                }}
              >
                جَليس
              </Typography>
            </Box>

            {/* 2. المنتصف: أزرار التنقل */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, justifyContent: 'center' }}>
              <Button onClick={() => scrollToSection('home-section')} sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>
                الرئيسية
              </Button>
              <Button onClick={() => scrollToSection('leaderboard-section')} sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>
                المتصدرين
              </Button>
              <Button onClick={() => scrollToSection('books-section')} sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>
                الكتب
              </Button>
            </Box>

            {/* 3. اليسار: شريط البحث + الإشعارات والبروفايل */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              
              <TextField
                size="small"
                placeholder="ابحث عن كتاب..."
                value={searchQuery}
                onChange={handleSearch}
                dir="rtl"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 2,
                  width: { xs: '130px', sm: '180px', md: '220px' },
                  '& .MuiOutlinedInput-root': { color: 'white', fontFamily: 'Cairo', '& fieldset': { border: 'none' } },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'white' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {user ? (
                  <>
                    {/* زر جرس الإشعارات مع شارة العدد */}
                    <IconButton onClick={handleOpenNotifyMenu} color="inherit">
                      <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon sx={{ color: 'white' }} />
                      </Badge>
                    </IconButton>

                    {/* القائمة المنسدلة الجديدة والمطورة للإشعارات */}
                    <Menu
                      anchorEl={anchorElNotify}
                      open={Boolean(anchorElNotify)}
                      onClose={handleCloseNotifyMenu}
                      PaperProps={{
                        sx: { 
                          width: 360, 
                          maxHeight: 450, 
                          mt: 1.5, 
                          borderRadius: 3, 
                          direction: 'rtl',
                          boxShadow: '0px 4px 20px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      {/* رأس القائمة: يحتوي على العنوان وزر تحديد الكل كمقروء */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5 }}>
                        <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#490E22' }} variant="subtitle1">
                          الإشعارات ({unreadCount})
                        </Typography>
                        {unreadCount > 0 && (
                          <Button 
                            size="small" 
                            startIcon={<DoneAllIcon sx={{ ml: 0.5, mr: 0 }} />}
                            onClick={handleMarkAllAsRead}
                            sx={{ 
                              fontFamily: 'Cairo', 
                              fontWeight: 'bold', 
                              color: '#490E22',
                              fontSize: '12px',
                              '&:hover': { bgcolor: 'rgba(73, 14, 34, 0.08)' }
                            }}
                          >
                            تحديد الكل كمقروء
                          </Button>
                        )}
                      </Box>
                      
                      <Divider />

                      <List sx={{ p: 0 }}>
                        {notifications.length === 0 ? (
                          <MenuItem disabled sx={{ justifyContent: 'center', py: 3 }}>
                            <Typography sx={{ fontFamily: 'Cairo', color: 'text.secondary' }}>لا توجد إشعارات</Typography>
                          </MenuItem>
                        ) : (
                          notifications.map((notification) => {
                            const isUnread = notification.read_at === null;
                            return (
                              <React.Fragment key={notification.id}>
                                <ListItem 
                                  button 
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  sx={{ 
                                    py: 1.5,
                                    px: 2.5,
                                    // تمييز الإشعار غير المقروء بخلفية ملونة خفيفة ونقطة تنبيه
                                    bgcolor: isUnread ? 'rgba(73, 14, 34, 0.04)' : 'transparent',
                                    borderRight: isUnread ? '4px solid #490E22' : '4px solid transparent',
                                    '&:hover': { bgcolor: 'rgba(73, 14, 34, 0.08)' },
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                <ListItemText 
  primary={getNotificationMessage(notification)} // 👈 استخدام الدالة المصلحة هنا
  primaryTypographyProps={{ 
    fontFamily: 'Cairo', 
    fontSize: '13.5px', 
    textAlign: 'right',
    fontWeight: isUnread ? 'bold' : 'normal',
    color: isUnread ? 'black' : 'text.secondary'
  }}
/>
                                </ListItem>
                                <Divider component="li" />
                              </React.Fragment>
                            );
                          })
                        )}
                      </List>
                    </Menu>

                    <IconButton onClick={() => navigate('/profile')}>
                      <Avatar 
                        src={user.profile_img} 
                        alt={user.name} 
                        sx={{ width: 40, height: 40, border: '2px solid white' }} 
                      />
                    </IconButton>
                  </>
                ) : (
                  <Button 
                    onClick={() => setOpenAuth(true)}
                    sx={{ 
                      color: 'white', 
                      fontFamily: 'Cairo', 
                      border: '1px solid rgba(255,255,255,0.5)',
                      borderRadius: '20px',
                      px: 2,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    تسجيل الدخول
                  </Button>
                )}
              </Box>

            </Box>

          </Toolbar>
        </Container>
      </AppBar>

      <Dialog 
        open={openAuth} 
        onClose={() => setOpenAuth(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <Auth onSuccess={handleAuthSuccess} onClose={() => setOpenAuth(false)} />
      </Dialog>
    </>
  );
};

export default Navbar;