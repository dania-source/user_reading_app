import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Avatar, CircularProgress, Container, Paper, Tabs, Tab, Grid } from '@mui/material';
import axios from 'axios';
import BookCard from './BookCard'; // 👈 استدعاء مكون كرت الكتاب الجديد الخاص بك (تأكد من صحة المسار المجلد)

const UserProfile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0: أنهى، 1: يقرأ الآن، 2: يريد القراءة
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
        console.error("Error fetching user data:", error);
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
      <Typography sx={{ textAlign: 'center', mt: 10, fontFamily: "Cairo" }}>
        المستخدم غير موجود
      </Typography>
    );

  const handleFollowToggle = async () => {
    const wasFollowing = userData.is_following; 
    const token = localStorage.getItem("token");

    try {
      setUserData(prev => {
        const isFollowingNow = !wasFollowing;
        const currentFollowers = prev.stats?.followers_count || 0;
        return {
          ...prev,
          is_following: isFollowingNow,
          stats: {
            ...prev.stats,
            followers_count: isFollowingNow ? currentFollowers + 1 : Math.max(0, currentFollowers - 1)
          }
        };
      });

      if (wasFollowing) {
        await axios.delete(`http://localhost:8000/api/unfollow/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`http://localhost:8000/api/follow/${userId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

    } catch (error) {
      console.error("Follow error:", error);
      setUserData(prev => {
        const currentFollowers = prev.stats?.followers_count || 0;
        return {
          ...prev,
          is_following: wasFollowing,
          stats: {
            ...prev.stats,
            followers_count: wasFollowing ? currentFollowers : currentFollowers
          }
        };
      });
      alert("حدث خطأ أثناء محاولة تعديل المتابعة");
    }
  };

  const handleToggleFavorite = (bookId) => {
    console.log(`تم الضغط على مفضلة الكتاب ذو المعرف: ${bookId}`);
    // يمكنك هنا مستقبلاً ربط الـ API الخاص بالمفضلة إذا رغبت في ذلك
  };
const renderBooksList = (books) => {
    if (!books || books.length === 0) {
      return (
        <Typography sx={{ fontFamily: "Cairo", textAlign: "center", color: "text.secondary", py: 4 }}>
          لا توجد كتب في هذه القائمة حالياً.
        </Typography>
      );
    }

    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {books.map((item) => {
          const bookData = item.book; 
          if (!bookData) return null;

          let finalCoverImg = '/images/default-book.jpg';
          
          if (bookData.cover_img) {
            let fileName = bookData.cover_img.replace('http://localhost:8000/', '');
            fileName = fileName.replace('storage/', '');
            fileName = fileName.replace('books/images/', '');
            fileName = fileName.replace(/^\//, '');

            const fullUrl = `http://localhost:8000/books/images/${fileName}`;
            finalCoverImg = encodeURI(fullUrl);
          }

          const formattedBook = {
            ...bookData,
            cover_img: finalCoverImg
          };

          return (
            <BookCard 
              key={item.id}
              book={formattedBook}
              mainColor={mainColor}
              isFavorite={false} 
              onToggleFavorite={handleToggleFavorite}
            />
          );
        })}
      </Grid>
    );
  };

  return (
    <Box sx={{ direction: "rtl", bgcolor: "#EFEDE1", minHeight: "100vh", pb: 5 }}>

      {/* 🖼️ الغلاف التراثي مع التعتيم والحد الذهبي */}
      <Box
        sx={{
          height: 380, 
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
            backgroundColor: 'rgba(66, 11, 31, 0.3)', 
            zIndex: 1
          }
        }}
      >
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
          <path
            fill="#EFEDE1" 
            fillOpacity="1"
            d="M0,224L120,208C240,192,480,160,720,176C960,192,1200,256,1320,288L1440,320L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
          ></path>
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
      <Container maxWidth="md">
        <Paper
          sx={{
            mt: -30, 
            p: 4,
            borderRadius: 4,
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)", 
            backgroundColor: "#EFEDE1",
            textAlign: "center",
            position: "relative",
            zIndex: 3 
          }}
        >
          {/* الصورة + الاسم */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Avatar
              src={userData?.profile_img ? encodeURI(userData.profile_img) : undefined}
              sx={{
                width: 130,
                height: 130,
                mx: "auto",
                mb: 2,
                border: `4px solid ${mainColor}`,
                boxShadow: '0px 8px 20px rgba(0,0,0,0.15)'
              }}
            />
            <Typography variant="h5" sx={{ fontFamily: "Cairo", fontWeight: "bold", color: mainColor }}>
              {userData?.name}
            </Typography>
            <Typography sx={{ color: mainColor, fontFamily: "Cairo" }}>
              {userData?.nickname}
            </Typography>
          </Box>

          {/* 📊 إحصائيات المتابعة */}
          <Box
            sx={{
              mt: 2,
              mb: 3,
              display: "flex",
              justifyContent: "center",
              gap: 6,
              color: mainColor,
              borderBottom: `1px dashed ${mainColor}40`,
              pb: 2
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: "Cairo" }}>
                {userData?.stats?.followers_count || 0}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "Cairo", color: "text.secondary" }}>المتابِعون</Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: "Cairo" }}>
                {userData?.stats?.following_count || 0}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "Cairo", color: "text.secondary" }}>أتابعهم</Typography>
            </Box>
          </Box>

          {/* 📚 أرقام إحصائيات القراءة المتصلة بالتبويبات */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 4, color: mainColor }}>
            <Box sx={{ textAlign: "center", cursor: "pointer" }} onClick={() => setActiveTab(0)}>
              <Typography variant="h5" fontWeight="bold" sx={{ fontFamily: "Cairo", color: activeTab === 0 ? '#D4AF37' : mainColor }}>
                {userData?.stats?.finished_count || 0}
              </Typography>
              <Typography sx={{ fontFamily: "Cairo", fontSize: '0.9rem' }}>أنهى</Typography>
            </Box>

            <Box sx={{ textAlign: "center", cursor: "pointer" }} onClick={() => setActiveTab(1)}>
              <Typography variant="h5" fontWeight="bold" sx={{ fontFamily: "Cairo", color: activeTab === 1 ? '#D4AF37' : mainColor }}>
                {userData?.stats?.reading_now_count || 0}
              </Typography>
              <Typography sx={{ fontFamily: "Cairo", fontSize: '0.9rem' }}>يقرأ الآن</Typography>
            </Box>

            <Box sx={{ textAlign: "center", cursor: "pointer" }} onClick={() => setActiveTab(2)}>
              <Typography variant="h5" fontWeight="bold" sx={{ fontFamily: "Cairo", color: activeTab === 2 ? '#D4AF37' : mainColor }}>
                {userData?.stats?.want_to_read_count || 0}
              </Typography>
              <Typography sx={{ fontFamily: "Cairo", fontSize: '0.9rem' }}>يريد قراءتها</Typography>
            </Box>
          </Box>

          {/* ➕ زر المتابعة */}
          <Box sx={{ mt: 4 }}>
            <button
              onClick={handleFollowToggle}
              style={{
                backgroundColor: userData?.is_following ? "#b71c1c" : mainColor,
                color: "white",
                padding: "10px 35px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontFamily: "Cairo",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.15)"
              }}
            >
              {userData?.is_following ? "إلغاء المتابعة" : "متابعة"}
            </button>
          </Box>
        </Paper>

        {/* 📑 قسم التبويبات الفعلي للكتب المستدعاة */}
        <Paper sx={{ mt: 3, p: 3, borderRadius: 4, backgroundColor: "#EFEDE1", border: '1px solid #D4AF3740' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            centered
            TabIndicatorProps={{ style: { backgroundColor: mainColor } }}
            sx={{
              '& .MuiTab-root': { fontFamily: 'Cairo', fontWeight: 'bold', color: '#777' },
              '& .Mui-selected': { color: `${mainColor} !important` }
            }}
          >
            <Tab label={`أنهى (${userData?.stats?.finished_count || 0})`} />
            <Tab label={`يقرأ الآن (${userData?.stats?.reading_now_count || 0})`} />
            <Tab label={`يريد قراءتها (${userData?.stats?.want_to_read_count || 0})`} />
          </Tabs>

          {/* عرض مصفوفة الكتب مع استخدام الـ BookCard السحري */}
          <Box sx={{ mt: 3 }}>
            {activeTab === 0 && renderBooksList(userData?.reading_lists?.finished)}
            {activeTab === 1 && renderBooksList(userData?.reading_lists?.reading_now)}
            {activeTab === 2 && renderBooksList(userData?.reading_lists?.want_to_read)}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default UserProfile;