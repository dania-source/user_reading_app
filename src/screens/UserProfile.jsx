import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Avatar, CircularProgress, Container, Paper } from '@mui/material';
import axios from 'axios';

const UserProfile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const mainColor = '#541029';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        if (!userId) return;

        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:8000/api/followed_users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setUserData(response.data.data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  if (!userData)
    return (
      <Typography sx={{ textAlign: 'center', mt: 10 }}>
        المستخدم غير موجود
      </Typography>
    );

  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem("token");
      const previousState = userData.is_following;

      setUserData(prev => ({ ...prev, is_following: !previousState }));

      if (previousState) {
        await axios.delete(`http://localhost:8000/api/unfollow/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`http://localhost:8000/api/follow/${userId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

    } catch (error) {
      setUserData(prev => ({ ...prev, is_following: !prev.is_following }));
      alert("حدث خطأ أثناء محاولة المتابعة");
    }
  };

  return (
    <Box sx={{ direction: "rtl", bgcolor: "#EFEDE1", minHeight: "100vh" }}>

      {/* 🖼️ الغلاف التراثي الجديد مع التعتيم والحد الذهبي */}
      <Box
        sx={{
          height: 380, // تم رفعه ليتناسق مع الانحناء
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
            backgroundColor: 'rgba(66, 11, 31, 0.3)', // طبقة التعتيم البرغندية
            zIndex: 1
          }
        }}
      >
        {/* 🌊 المنحنى الانسيابي والخط الذهبي السحري */}
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
          {/* المنحنى الأساسي باللون البيج المطابق تماماً لصفحتكِ */}
          <path
            fill="#EFEDE1" 
            fillOpacity="1"
            d="M0,224L120,208C240,192,480,160,720,176C960,192,1200,256,1320,288L1440,320L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
          ></path>

          {/* الخط الذهبي المحاكي للأناقة الأدبية */}
          <path
            d="M0,224L120,208C240,192,480,160,720,176C960,192,1200,256,1320,288L1440,320"
            fill="none"
            stroke="#D4AF37" 
            strokeWidth="5" 
            strokeLinecap="round"
          ></path>
        </Box>
      </Box>

      {/* محتوى كرت الحساب الشخصي */}
    {/* محتوى كرت الحساب الشخصي */}
<Container maxWidth="md">
  <Paper
    sx={{
      mt: -30, // 💡 التعديل السحري هنا: زدنا السحب السالب ليرتفع الكرت بالكامل فوق المنحنى
      p: 4,
      borderRadius: 4,
      boxShadow: "0 10px 30px rgba(0,0,0,0.12)", // جعلنا الظل أعمق قليلاً ليظهر الارتفاع بشكل أجمل
      backgroundColor: "#EFEDE1",
      textAlign: "center",
      position: "relative",
      zIndex: 3 
    }}
  >

    {/* الصورة + الاسم */}
    <Box sx={{ textAlign: "center", mb: 3 }}>
      <Avatar
        src={encodeURI(userData?.profile_img)}
        sx={{
          width: 130,
          height: 130,
          mx: "auto",
          mb: 2,
          border: `4px solid ${mainColor}`,
          boxShadow: '0px 8px 20px rgba(0,0,0,0.15)'
        }}
      />

      <Typography
        variant="h5"
        sx={{
          fontFamily: "Cairo",
          fontWeight: "bold",
          color: mainColor
        }}
      >
        {userData?.name}
      </Typography>

      <Typography
        sx={{
          color: mainColor,
          fontFamily: "Cairo"
        }}
      >
        {userData?.nickname}
      </Typography>
    </Box>

    {/* بقية الإحصائيات والأزرار كما هي دون تغيير... */}

          {/* الإحصائيات */}
          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "center",
              gap: 4,
              color: mainColor
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" fontWeight="bold" sx={{ fontFamily: "Cairo" }}>
                {userData?.stats?.want_to_read_count}
              </Typography>
              <Typography sx={{ fontFamily: "Cairo" }}>يريد قراءتها</Typography>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" fontWeight="bold" sx={{ fontFamily: "Cairo" }}>
                {userData?.stats?.reading_now_count}
              </Typography>
              <Typography sx={{ fontFamily: "Cairo" }}>يقرأ الآن</Typography>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" fontWeight="bold" sx={{ fontFamily: "Cairo" }}>
                {userData?.stats?.finished_count}
              </Typography>
              <Typography sx={{ fontFamily: "Cairo" }}>أنهى</Typography>
            </Box>
          </Box>

          {/* زر المتابعة */}
          <Box sx={{ mt: 3 }}>
            <button
              onClick={handleFollowToggle}
              style={{
                backgroundColor: userData?.is_following ? "#b71c1c" : mainColor,
                color: "white",
                padding: "10px 25px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontFamily: "Cairo",
                fontSize: "1rem",
                transition: "all 0.3s ease"
              }}
            >
              {userData?.is_following ? "إلغاء المتابعة" : "متابعة"}
            </button>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
};

export default UserProfile;