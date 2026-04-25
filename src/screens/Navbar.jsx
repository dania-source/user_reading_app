import React from 'react';
import { AppBar, Container, Toolbar, TextField, InputAdornment, Avatar, IconButton, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ searchQuery, handleSearch, mainColor, user }) => {
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" sx={{ background: mainColor, boxShadow: 'none' }}>
      <Container>
        <Toolbar sx={{ justifyContent: 'space-between', px: 0 }}>
          
          {/* المنطقة اليسرى: أيقونة المستخدم أو زر تسجيل الدخول */}
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100px' }}>
            {user ? (
              // إذا كان المستخدم مسجل دخول، تظهر الصورة
              <IconButton onClick={() => navigate('/profile')}>
                <Avatar 
                  src={user.profile_img} 
                  alt={user.name} 
                  sx={{ width: 40, height: 40, border: '2px solid white' }} 
                />
              </IconButton>
            ) : (
              // إذا لم يسجل دخول، نتركها فارغة تماماً كما طلبت
              // أو يمكنك وضع زر "دخول" بسيط هنا إذا غيرت رأيك لاحقاً
              null 
            )}
          </Box>

          {/* شريط البحث */}
          <TextField
            size="small"
            placeholder="ابحث عن كتاب..."
            value={searchQuery}
            onChange={handleSearch}
            dir="rtl"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 2,
              width: { xs: '60%', md: '40%' },
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
  );
};

export default Navbar;