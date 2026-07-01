import React from 'react';
import { Box, Container, Typography, Avatar } from '@mui/material';

const LeaderboardSection = ({ leaderboard, token, currentUserId, navigate, mainColor }) => {
  return (
    <Container id="leaderboard-section" sx={{ mt: 10, mb: 10 }}>
      <Typography variant="h4" sx={{ fontFamily: 'Cairo', textAlign: 'center', mb: 10, color: mainColor, fontWeight: 'bold' }}>
        نخبة القراء
      </Typography>

      {/* منصة التتويج للمراكز الثلاثة الأولى */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 2, maxWidth: '800px', mx: 'auto', mb: 5 }}>
        {leaderboard.slice(0, 3).map((userItem, index) => { 
          const orders = [2, 1, 3]; // ترتيب العرض لجعل المركز الأول في المنتصف
          const isFirst = index === 0;
          const userId = userItem.id || userItem.user_id;
          const isMyProfile = currentUserId && userId && String(currentUserId) === String(userId);

          // 1. تحديد الألوان الخاصة بالأوسمة والشارات
          const medalColors = isFirst ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32';

          // 2. مصفوفة الألوان الخلفية الناعمة للكروت (ذهبي خفيف، فضي ناعم، برونزي دافئ)
          const cardBackgrounds = isFirst ? '#FFF9E6' : index === 1 ? '#F5F5F5' : '#FAF2EC';

          const handleProfileNavigation = () => {
            if (!token) return;
            if (isMyProfile) {
              navigate('/profile'); 
            } else {
              navigate(`/user-profile/${userId}`);
            }
          };

          return (
            <Box key={index} sx={{ 
              order: orders[index],
              flex: 1, 
              bgcolor: cardBackgrounds, // تعديل الخلفية هنا لتصبح ملونة حسب المركز
              p: isFirst ? 4 : 2, 
              borderRadius: 4, 
              textAlign: 'center',
              position: 'relative',
              boxShadow: isFirst ? '0 15px 35px rgba(84, 16, 41, 0.15)' : '0 4px 12px rgba(0,0,0,0.03)',
              border: isFirst ? `2px solid ${medalColors}` : '1px solid #eee', // جعل الإطار متناسقاً مع لون الوسام
              zIndex: isFirst ? 2 : 1,
              mt: isFirst ? 0 : 4 // إزاحة المراكز الجانبية لأسفل قليلاً لإبراز الأول
            }}>
              
              {/* شارة المركز الرقمية */}
              <Box sx={{ 
                position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)',
                bgcolor: medalColors,
                color: isFirst ? '#333' : 'white', // جعل رقم المركز الأول داكناً ليتناسق مع اللون الذهبي
                px: 1.5, py: 0.3, borderRadius: 5, fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                المركز {index + 1}
              </Box>

              {/* عرض الصورة الشخصية أو أول حرف من الاسم */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, mt: 1 }}>
                <Avatar
                  src={userItem.profile_img} 
                  onClick={handleProfileNavigation}
                  sx={{
                    width: isFirst ? 80 : 65,
                    height: isFirst ? 80 : 65,
                    fontSize: isFirst ? '1.8rem' : '1.4rem',
                    fontFamily: 'Cairo',
                    fontWeight: 'bold',
                    border: `3px solid ${medalColors}`,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    cursor: token ? 'pointer' : 'default',
                    bgcolor: !userItem.profile_img ? mainColor : 'transparent', 
                    color: 'white',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: token ? 'scale(1.08)' : 'none'
                    }
                  }}
                >
                  {!userItem.profile_img && userItem.name ? userItem.name.charAt(0).toUpperCase() : null}
                </Avatar>
              </Box>

              <Typography 
                component="div"
                onClick={handleProfileNavigation} 
                sx={{ 
                  fontFamily: 'Cairo', 
                  fontWeight: 'bold', 
                  fontSize: isFirst ? '1rem' : '0.85rem', 
                  display: 'block', 
                  color: '#222', // تعديل لون الخط ليكون داكناً وواضحاً فوق الخلفيات الملونة
                  cursor: token ? 'pointer' : 'default',
                  '&:hover': { color: token ? mainColor : 'inherit' },
                }}
              >
                {userItem.name} {isMyProfile && " (أنت)"}
              </Typography>

              <Typography sx={{ fontFamily: 'Cairo', fontSize: '0.7rem', color: '#555', mb: 1 }}>
                {userItem.nickname}
              </Typography>

              <Typography sx={{ fontWeight: 'bold', color: mainColor, fontSize: isFirst ? '1.2rem' : '1rem' }}>
                {userItem.books_read} <small style={{fontSize: '0.65rem'}}>كتاب</small>
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* باقي المتصدرين من المركز الرابع حتى العاشر */}
      <Box sx={{ maxWidth: '850px', mx: 'auto', bgcolor: 'white', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {leaderboard.slice(3, 10).map((userItem, index) => {
          const userId = userItem.id || userItem.user_id;
          const isMyProfile = currentUserId && userId && String(currentUserId) === String(userId);

          const handleProfileNavigation = () => {
            if (!token) return;
            if (isMyProfile) {
              navigate('/profile'); 
            } else {
              navigate(`/user-profile/${userId}`);
            }
          };

          return (
            <Box 
              key={index} 
              component="div"
              onClick={handleProfileNavigation}
              sx={{ 
                display: 'flex', 
                color: 'inherit',
                cursor: token ? 'pointer' : 'default',
                justifyContent: 'space-between', 
                alignItems: 'center', 
                p: 2, 
                borderBottom: '1px solid #f5f5f5',
                '&:hover': { bgcolor: token ? '#fafafa' : 'white' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ color: '#ccc', fontWeight: 'bold', width: 25 }}>{index + 4}</Typography>
                <Box> 
                  <Typography sx={{ fontFamily: 'Cairo', fontSize: '0.9rem', fontWeight: 500 }}>
                    {userItem.name} {isMyProfile && " (أنت)"}
                  </Typography>
                  <Typography sx={{ fontFamily: 'Cairo', fontSize: '0.7rem', color: 'gray' }}>{userItem.nickname}</Typography>
                </Box>
              </Box>
              <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: mainColor, fontSize: '0.9rem' }}>
                {userItem.books_read} كتاب
              </Typography>
            </Box>
          );
        })}
      </Box>

      {!token && (
        <Typography sx={{ fontFamily: 'Cairo', textAlign: 'center', mt: 3, color: 'gray', fontSize: '0.9rem' }}>
          سجل دخولك لتتمكن من تصفح حسابات القراء ومتابعتهم
        </Typography>
      )}
    </Container>
  );
};

export default LeaderboardSection;