import React, { useState, useEffect } from 'react';
import { 
  AppBar, Container, Toolbar, TextField, InputAdornment, 
  Avatar, IconButton, Box, Button, Dialog,Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import Auth from './Auth'; 

const Navbar = ({ user, mainColor, searchQuery, handleSearch, setUser }) => {
  const navigate = useNavigate();
  const [openAuth, setOpenAuth] = useState(false);

  // إعادة الدالة لمكانها لضمان عملها فوراً عند الضغط
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // حساب مسافة الإزاحة لأن الشريط (AppBar) ثابت ويغطي جزءاً من السكشن
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

return (
    <>
      <AppBar position="fixed" sx={{ background: '#490E22', boxShadow: 'none' }}>
        <Container maxWidth="xl"> {/* تكبير الحاوية قليلاً لراحة العناصر */}
          <Toolbar sx={{ justifyContent: 'space-between', px: 0, direction: 'rtl' }}>
            
            {/* 1. اليمين تماماً: لوغو المنصة واسمها مستقل ومثبت */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                cursor: 'pointer'
              }}
              onClick={() => scrollToSection('home-section')}
            >
              {/* صورة اللوغو بمقاس ممتاز ومريح */}
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

              {/* اسم المنصة بجانب اللوغو مباشرة */}
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

            {/* 2. المنتصف تماماً: أزرار التنقل (معزولة ومحمية من التداخل) */}
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

            {/* 3. اليسار: شريط البحث + منطقة البروفايل مجتمعين معاً بذكاء */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              
              {/* شريط البحث بمقاس ثابت ومثالي لا يتمدد */}
              <TextField
                size="small"
                placeholder="ابحث عن كتاب..."
                value={searchQuery}
                onChange={handleSearch}
                dir="rtl"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 2,
                  width: { xs: '130px', sm: '180px', md: '220px' }, // حجم ذكي وثابت يمنع القفز والتداخل
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

              {/* أيقونة البروفايل أو تسجيل الدخول */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {user ? (
                  <IconButton onClick={() => navigate('/profile')}>
                    <Avatar 
                      src={user.profile_img} 
                      alt={user.name} 
                      sx={{ width: 40, height: 40, border: '2px solid white' }} 
                    />
                  </IconButton>
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

      {/* نافذة تسجيل الدخول المنبثقة */}
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