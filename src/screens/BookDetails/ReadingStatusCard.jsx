import React from 'react';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ReadingStatusCard = ({ readingStatus, loadingStatus, mainColor, handleStatusClick }) => {
  // 🔍 فحص هل المستخدم مسجل دخول أم لا
  const isLoggedIn = Boolean(localStorage.getItem('user_id'));

  const statusItems = [
    { id: 'أقرأها الآن', text: 'أقرأه الآن', icon: <AutoStoriesIcon fontSize="small" /> },
    { id: 'أرغب بقراءتها', text: 'أريد قراءته', icon: <BookmarkBorderIcon fontSize="small" /> },
    { id: 'أنهيتها', text: 'أنهيته', icon: <CheckCircleIcon fontSize="small" /> }
  ];

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '3px solid #602134', bgcolor:'#f4f1ea', mb: 4, position: 'relative' }}>
      {loadingStatus && (
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', zIndex: 2 }}>
          <CircularProgress size={24} sx={{ color: mainColor }} />
        </Box>
      )}
      
      {/* عنوان القسم: يتحول للرمادي أيضاً إذا لم يسجل دخول */}
      <Typography variant="subtitle2" sx={{ fontFamily: 'Cairo', fontWeight: 700, mb: 2, color: isLoggedIn ? mainColor : '#8e8a82', textAlign: { xs: 'center', sm: 'right' } }}>
        أضف الكتاب إلى قوائمك:
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {statusItems.map((item) => {
          const isActive = readingStatus === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? 'contained' : 'outlined'}
              startIcon={item.icon}
              onClick={() => isLoggedIn && handleStatusClick(item.id)}
              disabled={!isLoggedIn} // 🔒 قفل الزر تماماً في حال عدم تسجيل الدخول
              sx={{
                fontFamily: 'Cairo', borderRadius: '50px', flexGrow: 1, py: 1.2, fontWeight: 700, fontSize: '0.9rem',
                bgcolor: isActive ? mainColor : 'transparent',
                color: isActive ? '#fff' : mainColor,
                borderColor: mainColor,
                '&:hover': { borderColor: mainColor, bgcolor: isActive ? mainColor : 'rgba(84, 16, 41, 0.04)' },
                
                // 🎨 تنسيق اللون الرمادي المخصص عندما يكون الزر Disabled
                '&.Mui-disabled': {
                  borderColor: '#bdbdbd',
                  color: '#9e9e9e',
                  bgcolor: 'transparent',
                  '& .MuiButton-startIcon': {
                    color: '#9e9e9e' 
                  }
                },

                '& .MuiButton-startIcon': {
                  marginLeft: '8px', 
                  marginRight: '-4px'
                }
              }}
            >
              {item.text}
            </Button>
          );
        })}
      </Box>
    </Paper>
  );
};

export default ReadingStatusCard;