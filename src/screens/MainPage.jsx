import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Grid, CircularProgress, Typography, Modal, Fade,Button } from '@mui/material';
import axios from 'axios';
import Waves from './Waves';
import Auth from './Auth';
import Navbar from './Navbar'; 
import BookCard from './BookCard';
import BookDetailsModal from './BookDetailsModal';
  import { useNavigate } from 'react-router-dom';
  import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { Link } from 'react-router-dom';

// ==========================================
// 💡 ضعي مكون الجزيئات السحرية هنا (خارج المكون الرئيسي)
// ==========================================
const MagicParticles = () => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particlesArray = [];
    const mouse = { x: null, y: null };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      for (let i = 0; i < 2; i++) {
        particlesArray.push(new Particle(mouse.x, mouse.y));
      }
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    canvas.parentElement.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement.addEventListener('mouseleave', handleMouseLeave);

    class Particle {
      constructor(x, y) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1.5 - 0.75;
        this.speedY = Math.random() * -1.5 - 0.2; 
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.2})`;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.1) this.size -= 0.01;
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      if (particlesArray.length < 60) {
        particlesArray.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      init();
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        if (particlesArray[i].size <= 0.1 || particlesArray[i].y < 0) {
          particlesArray.splice(i, 1);
          i--;
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (canvas.parentElement) {
        canvas.parentElement.removeEventListener('mousemove', handleMouseMove);
        canvas.parentElement.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', 
        zIndex: 1,
      }}
    />
  );
};
const MainPage = () => {
  const mainColor = '#541029';

  // --- States ---
const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [pendingPdf, setPendingPdf] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [user, setUser] = useState(null); // الـ user تم تعريفه هنا
  const [visibleBooks, setVisibleBooks] = useState(8); 
  const [leaderboard, setLeaderboard] = useState([]);
const token = localStorage.getItem('token'); // نتحقق من وجود التوكن
const currentUserId = user?.id || user?.user_id; // 💡 التعديل هنا
const navigate = useNavigate();
const slidesData = [
  {
    title: "انطلِق في تحدي العمر",
    desc: "في منصة جَليس، القراءة ليست مجرد هواية، بل هي رحلة مليئة بالتحديات والمغامرات الشيّقة بين صفحات الكتب. ابدأ كتابك الأول اليوم!",
    image: "/images/reading_girl_cartoon.png"
  },
  {
    title: "تسيّد جدول المتصدرين",
    desc: "نافِس قُرّاء العالم العربي، اجمع النقاط مع كل صفحة تقلبها، واعتلِ صدارة القائمة لتثبت للجميع أنك القارئ الأفضل في نخبة القراء.",
    image: "/images/thinking_girl_cartoon.png"
  },
  {
    title: "اكسب ألقاباً تليق بشغفك",
    desc: "من 'قارئ مبتدئ' إلى 'الحكيم' و'المثقف اللامع'؛ حوّل قراءاتك إلى ألقاب وإنجازات تفتخر بها. كل كتاب تقرأه يمنحك وِساماً جديداً!",
    image: "/images/waving_girl_cartoon.png"
  }
];
const handleUserClick = (userId) => {
    navigate(`/user-profile/${userId}`);
};
 
  // --- Functions ---

  // دالة لجلب بيانات المستخدم (الملف الشخصي)
  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const response = await axios.get('http://localhost:8000/api/info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error("فشل جلب بيانات المستخدم");
      setUser(null);
    }
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const response = await axios.get('http://localhost:8000/api/books', config);
      if (response.data.success) setBooks(response.data.data);
    } catch (error) {
      console.error("خطأ في جلب الكتب:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // جلب الكتب وبيانات المستخدم عند تحميل الصفحة
  useEffect(() => { 
    fetchBooks(); 
    fetchUserData();
  }, [fetchBooks, fetchUserData]);

const handleSearch = async (e) => {
  const value = e.target.value;
  setSearchQuery(value);

  // إذا كان المستخدم يكتب، انزل لقسم الكتب
  if (value.trim().length > 0) {
    const booksSection = document.getElementById('books-section');
    if (booksSection) {
      booksSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // إذا كان الحقل فارغ → رجّع كل الكتب
  if (value.trim() === '') {
    fetchBooks();
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    const response = await axios.get(
      `http://localhost:8000/api/books/search?query=${value}`,
      config
    );

    if (response.data.success) {
      setBooks(response.data.data);
    }
  } catch (error) {
    console.error("خطأ في البحث:", error);
  }
};

const handleToggleFavorite = async (bookId) => {
  const token = localStorage.getItem('token');
  
  // إذا لم يكن هناك مستخدم مسجل، نفتح نافذة تسجيل الدخول
  if (!token) {
    setOpenAuthModal(true);
    return;
  }

  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  // فحص هل الكتاب موجود حالياً في مصفوفة المفضلة بالـ State
  const isFav = favoriteIds.includes(bookId);

  try {
    if (isFav) {
      // 1. إذا كان القلب أحمر (موجود): نقوم بحذفه من السيرفر
      const res = await axios.delete(`http://localhost:8000/api/delete_favorites/${bookId}`, config);
      
      if (res.data.success) {
        // تحديث الواجهة: حذف الـ ID من المصفوفة ليختفي اللون الأحمر
        setFavoriteIds(prev => prev.filter(id => id !== bookId));
      }
    } else {
      // 2. إذا كان القلب رمادي (غير موجود): نقوم بإضافته للسيرفر
      const res = await axios.post('http://localhost:8000/api/add_favorites', { book_id: bookId }, config);
      
      if (res.data.success) {
        // تحديث الواجهة: إضافة الـ ID للمصفوفة ليصبح القلب أحمر
        setFavoriteIds(prev => [...prev, bookId]);
      }
    }
  } catch (err) {
    console.error("خطأ في تحديث المفضلة:", err);
  }
};
  const handleOpenDetails = async (id) => {
    setOpen(true);
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setSelectedBook(response.data.data);
    } catch (error) { setOpen(false); }
    finally { setDetailsLoading(false); }
  };

  const handleReadClick = (pdfPath) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setPendingPdf(pdfPath);
      setOpenAuthModal(true);
    } else {
      window.open(pdfPath, '_blank');
    }
  };

  // دالة تُستدعى عند نجاح تسجيل الدخول
  const handleAuthSuccess = () => {
    setOpenAuthModal(false);
    fetchUserData(); // تحديث بيانات المستخدم فوراً لتظهر في الـ Navbar
    if (pendingPdf) {
      window.open(pendingPdf, '_blank');
      setPendingPdf(null);
    }
  };
useEffect(() => {
  const fetchFavorites = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:8000/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // استخراج الـ IDs فقط من البيانات
      const ids = res.data.data.map(fav => fav.book.id);
      setFavoriteIds(ids);
    } catch (err) {
      console.error("خطأ في جلب المفضلة", err);
    }
  };
  
  fetchBooks(); 
  fetchUserData();
  fetchFavorites(); // استدعاء دالة جلب المفضلة
}, [fetchBooks, fetchUserData]);

const fetchLeaderboard = useCallback(async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:8000/api/users_pogress_list', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.success) {
      setLeaderboard(response.data.data);
    }
  } catch (error) {
    console.error("خطأ في جلب لوحة المتصدرين", error);
  }
}, []);

useEffect(() => {
  fetchLeaderboard();
}, [fetchLeaderboard]);
  return (
    
<Box sx={{ minHeight: '100vh', bgcolor: '#EFEDE1', scrollBehavior: 'smooth' }}>      
      <Navbar 
      user={user}
       setUser={setUser}
      searchQuery={searchQuery} 
      handleSearch={handleSearch} 
      mainColor={mainColor} 
    />

<Box
  id="home-section"
  sx={{
    position: 'relative',
    background: `linear-gradient(-45deg, ${mainColor}, #821c3e, #5a1228, #3b0a18)`,
    backgroundSize: '400% 400%',
    animation: 'gradientAnimation 12s ease infinite',
    // 👇 قمنا بتقليص الـ padding العلوي والسفلي ليرتفع السلايدر بالكامل للأعلى
    pt: { xs: 8, md: 12 }, 
    pb: { xs: 18, md: 22 }, 
    textAlign: 'center',
    color: 'white',
    overflow: 'hidden',
    cursor: 'grab',
    '&:active': { cursor: 'grabbing' },
    '@keyframes gradientAnimation': {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },
    '& .swiper-pagination-bullet': {
      background: '#FFF',
      opacity: 0.4,
      width: '10px',
      height: '10px',
      transition: 'all 0.3s ease',
    },
    '& .swiper-pagination-bullet-active': {
      background: '#F3C5C7',
      width: '24px',
      borderRadius: '5px',
      opacity: 1,
    },
    '& .swiper-pagination': {
      bottom: '60px !important', // موضع مناسب ومرفوع للنقاط
      zIndex: 10,
    }
  }}
>
  {/* استدعاء تأثير الجزيئات السحرية التفاعلية */}
  <MagicParticles />

<Container
  maxWidth="lg" // نجعله كبيراً ليعطي مساحة للتباعد
  sx={{
    position: 'relative',
    zIndex: 2,
    animation: 'fadeInUp 1.2s ease-out forwards',
  }}
>
  <Swiper
    modules={[Pagination, Autoplay]}
    spaceBetween={0}
    slidesPerView={1}
    pagination={{ clickable: true }}
    autoplay={{ delay: 5000, disableOnInteraction: false }}
    loop={true}
    style={{ width: '100%' }}
  >
    {slidesData.map((slide, index) => (
      <SwiperSlide key={index}>
        <Grid 
          container 
          sx={{ 
            alignItems: 'center', 
            // 👇 هذا السطر هو السر! يوزع المحتوى بحيث يدفع أحدهما لليمين والآخر لليسار
            justifyContent: 'space-between', 
            direction: 'rtl',
            minHeight: '400px' // يضمن ثبات الارتفاع
          }}
        >
          
          {/* -- عمود النصوص (مدفوع لأقصى اليمين) -- */}
        {/* -- عمود النصوص (مدفوع لأقصى اليمين ومرفوع للأعلى) -- */}
<Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
  <Box 
    sx={{ 
      p: { xs: 2, md: 0 },
      // 👇 هذه الحيلة لرفع النص فقط للأعلى بمقدار 25 بكسل على الشاشات الكبيرة
      transform: { xs: 'none', md: 'translateY(-70px)' }, 
      transition: 'transform 0.3s ease'
    }}
  >
    <Typography
      variant="h1"
      fontWeight="900"
      sx={{
        fontFamily: 'Cairo, sans-serif',
        mb: 2, // مسافة مناسبة تحت العنوان
        fontSize: { xs: '2.2rem', md: '3.8rem' },
        background: 'linear-gradient(45deg, #FFF 30%, #F3C5C7 90%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        // filter: 'drop-shadow(0px 4px 15px #F3C5C7)',
      }}
    >
      {slide.title}
    </Typography>

    <Typography
      variant="h6"
      sx={{
        fontFamily: 'Cairo, sans-serif',
        opacity: 0.9,
        lineHeight: 1.8,
        fontSize: { xs: '1rem', md: '1.25rem' },
        color: '#F5F5F7',
        maxWidth: '500px', 
        marginRight: 0,
        marginLeft: 'auto'
      }}
    >
      {slide.desc}
    </Typography>
  </Box>
</Grid>

          {/* -- عمود الصورة (مدفوع لأقصى اليسار) -- */}
          <Grid 
            item 
            xs={12} 
            md={5} 
            sx={{ 
              display: 'flex', 
              // 👇 دفع الصورة لليسار تماماً (بالنسبة للـ md)
              justifyContent: { xs: 'center', md: 'flex-start' }, 
              alignItems: 'center'
            }}
          >
            <Box
              component="img"
              src={slide.image} 
              alt={slide.title}
              sx={{
                width: '100%',
                maxWidth: { xs: '220px', md: '350px' }, 
                height: 'auto',
                // filter: 'drop-shadow(0px 10px 30px rgba(243, 197, 199, 0.4))', 
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.05)' },
                // الحيلة لتعويض الفراغ في الصورة الأولى لو وُجد
                transform: index === 0 ? { md: 'translateX(-20px)' } : 'none',
              }}
            />
          </Grid>

        </Grid>
      </SwiperSlide>
    ))}
  </Swiper>
</Container>

  {/* التموج السفلي */}
  <Waves />
</Box>
      {/* نهاية الـ Hero Section المطور */}

<Container id="leaderboard-section" sx={{ mt: 10, mb: 10 }}>
    <Typography variant="h4" sx={{ fontFamily: 'Cairo', textAlign: 'center', mb: 10, color: mainColor, fontWeight: 'bold' }}>
        نخبة القراء
    </Typography>

    {/* منطقة المنصة - المراكز الثلاثة الأولى */}
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 2, maxWidth: '800px', mx: 'auto', mb: 2 }}>
        {leaderboard.slice(0, 3).map((userItem, index) => { 
            const orders = [2, 1, 3]; 
            const isFirst = index === 0;
            
            const userId = userItem.id || userItem.user_id;
            // فحص هل هذا الحساب يطابق حسابي
            const isMyProfile = currentUserId && userId && String(currentUserId) === String(userId);

            // الدالة التي تنقل المستخدم للمسار الصحيح المتوافق مع App.js
            const handleProfileNavigation = () => {
                if (!token) return;
                if (isMyProfile) {
                    navigate('/profile'); // 💡 تم التعديل هنا لتصبح /profile تماماً مثل App.js
                } else {
                    navigate(`/user-profile/${userId}`);
                }
            };

            return (
                <Box key={index} sx={{ 
                    order: orders[index],
                    flex: 1, 
                    bgcolor: 'white', 
                    p: isFirst ? 4 : 2, 
                    borderRadius: 4, 
                    textAlign: 'center',
                    position: 'relative',
                    mb: isFirst ? 5 : 0, 
                    boxShadow: isFirst ? '0 15px 35px rgba(84, 16, 41, 0.15)' : '0 4px 12px rgba(0,0,0,0.03)',
                    border: isFirst ? `2px solid ${mainColor}` : '1px solid #eee',
                    zIndex: isFirst ? 2 : 1
                }}>
                    <Box sx={{ 
                        position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)',
                        bgcolor: isFirst ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                        color: 'white', px: 1.5, py: 0.3, borderRadius: 5, fontSize: '0.7rem', fontWeight: 'bold', whiteSpace: 'nowrap'
                    }}>
                        المركز {index + 1}
                    </Box>

                    <Typography 
                        component="div"
                        onClick={handleProfileNavigation} 
                        sx={{ 
                            fontFamily: 'Cairo', 
                            fontWeight: 'bold', 
                            fontSize: isFirst ? '1rem' : '0.8rem', 
                            mt: 1, 
                            display: 'block', 
                            color: 'inherit',
                            cursor: token ? 'pointer' : 'default',
                            '&:hover': { color: token ? mainColor : 'inherit' },
                        }}
                    >
                        {userItem.name} {isMyProfile && " (أنت)"}
                    </Typography>

                    <Typography sx={{ fontFamily: 'Cairo', fontSize: '0.7rem', color: 'gray', mb: 1 }}>
                        {userItem.nickname}
                    </Typography>
                    <Typography sx={{ fontWeight: 'bold', color: mainColor, fontSize: isFirst ? '1.2rem' : '1rem' }}>
                        {userItem.books_read} <small style={{fontSize: '0.6rem'}}>كتاب</small>
                    </Typography>
                </Box>
            );
        })}
    </Box>

    {/* الجدول - من المركز الرابع حتى العاشر */}
    <Box sx={{ maxWidth: '850px', mx: 'auto', bgcolor: 'white', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {leaderboard.slice(3, 10).map((userItem, index) => {
            const userId = userItem.id || userItem.user_id;
            const isMyProfile = currentUserId && userId && String(currentUserId) === String(userId);

            const handleProfileNavigation = () => {
                if (!token) return;
                if (isMyProfile) {
                    navigate('/profile'); // 💡 تم التعديل هنا أيضاً ليصبح /profile
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
                        <Box > 
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
    {/* Books Grid - إضافة الـ ID */}
 {/* Books Grid */}
<Container id="books-section" sx={{ mt: 5, position: 'relative', zIndex: 5, pb: 10 }}>
  <Typography variant="h4" sx={{ fontFamily: 'Cairo', textAlign: 'center', mb: 4, color: mainColor, fontWeight: 'bold' }}>
    المكتبة الرقمية
  </Typography>
  
  {loading ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress sx={{ color: mainColor }} /></Box>
  ) : (
    <>
      <Grid container spacing={3} sx={{ p: 2 }}>
        {/* نعرض فقط عدد الكتب المحدد في visibleBooks */}
        {books.slice(0, visibleBooks).map((book) => (
          <BookCard 
            key={book.id} 
            book={book} 
            onOpenDetails={handleOpenDetails} 
            mainColor={mainColor}  
            onToggleFavorite={handleToggleFavorite} 
            isFavorite={favoriteIds.includes(book.id)} 
          />
        ))}
      </Grid>

      {/* زر عرض المزيد - يظهر فقط إذا كان هناك كتب أكثر للعرض */}
      {books.length > visibleBooks && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <Button 
            variant="outlined" 
            onClick={() => setVisibleBooks(prev => prev + 8)} // نزيد 8 كتب إضافية عند الضغط
            sx={{ 
              fontFamily: 'Cairo', 
              color: mainColor, 
              borderColor: mainColor,
              px: 4,
              borderRadius: 2,
              '&:hover': { bgcolor: mainColor, color: 'white', borderColor: mainColor }
            }}
          >
            عرض المزيد
          </Button>
        </Box>
      )}
    </>
  )}
 </Container>

      <BookDetailsModal 
        open={open} 
        handleClose={() => setOpen(false)} 
        selectedBook={selectedBook} 
        detailsLoading={detailsLoading} 
        mainColor={mainColor} 
        handleReadClick={handleReadClick} 
      />

      <Modal open={openAuthModal} onClose={() => setOpenAuthModal(false)}>
        <Fade in={openAuthModal}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', md: '750px' }, bgcolor: 'background.paper', borderRadius: 4, overflow: 'hidden', outline: 'none' }}>
            {/* استدعاء دالة النجاح المعدلة */}
            <Auth onSuccess={handleAuthSuccess} onClose={() => setOpenAuthModal(false)} />
          </Box>
        </Fade>
      </Modal>

    </Box>
  );
};

export default MainPage;