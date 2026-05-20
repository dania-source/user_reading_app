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

      // تحديث الواجهة مباشرة
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
      // إعادة الحالة إذا فشل الطلب
      setUserData(prev => ({ ...prev, is_following: !prev.is_following }));
      alert("حدث خطأ أثناء محاولة المتابعة");
    }
  };

  return (
    <Box sx={{ direction: "rtl", bgcolor: "#EFEDE1", minHeight: "100vh" }}>

      {/* الغلاف */}
      <Box
        sx={{
          height: 180,
          background: `linear-gradient(45deg, ${mainColor}, #6d0f2b)`
        }}
      />

      <Container maxWidth="md">
        <Paper
          sx={{
            mt: -8,
            p: 4,
            borderRadius: 4,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            backgroundColor: "#EFEDE1",
            textAlign: "center"
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
              <Typography variant="h5" fontWeight="bold">
                {userData?.stats?.want_to_read_count}
              </Typography>
              <Typography>يريد قراءتها</Typography>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" fontWeight="bold">
                {userData?.stats?.reading_now_count}
              </Typography>
              <Typography>يقرأ الآن</Typography>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" fontWeight="bold">
                {userData?.stats?.finished_count}
              </Typography>
              <Typography>أنهى</Typography>
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
                fontSize: "1rem"
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
