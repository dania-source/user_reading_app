import React, { useState } from 'react';
import { 
  AppBar, Container, Toolbar, TextField, InputAdornment, 
  Avatar, IconButton, Box, Button, Dialog 
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
      <AppBar position="fixed" sx={{ background: mainColor, boxShadow: 'none' }}>
        <Container>
          <Toolbar sx={{ justifyContent: 'space-between', px: 0 }}>
            
            {/* 1. المنطقة اليسرى: البروفايل أو تسجيل الدخول */}
            <Box sx={{ display: 'flex', alignItems: 'center', width: '120px' }}>
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
                    px: 2
                  }}
                >
                  تسجيل الدخول
                </Button>
              )}
            </Box>

            {/* 2. أزرار التنقل (تم تصحيحها هنا) */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
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

            {/* 3. شريط البحث */}
            <TextField
              size="small"
              placeholder="ابحث عن كتاب..."
              value={searchQuery}
              onChange={handleSearch}
              dir="rtl"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 2,
                width: { xs: '45%', md: '25%' },
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