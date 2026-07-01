import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Grid, CircularProgress, Typography, Modal, Fade, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// استيراد المكونات من نفس المجلد الحالي
import Navbar from './Navbar'; 
import BookCard from './BookCard';
import Auth from './Auth';
import HeroSection from './HeroSection';
import LeaderboardSection from './LeaderboardSection';

const MainPage = () => {
  const mainColor = '#541029';

  // --- States ---
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [pendingPdf, setPendingPdf] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [user, setUser] = useState(null); 
  const [visibleBooks, setVisibleBooks] = useState(8); 
  const [leaderboard, setLeaderboard] = useState([]);

  const token = localStorage.getItem('token'); 
  const currentUserId = user?.id || user?.user_id; 
  const navigate = useNavigate();

  // --- Functions ---
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
    const initPageData = async () => {
      fetchUserData();
      fetchLeaderboard();

      const token = localStorage.getItem('token');
      let currentFavIds = [];
      if (token) {
        try {
          const res = await axios.get('http://localhost:8000/api/favorites', {
            headers: { Authorization: `Bearer ${token}` }
          });
          currentFavIds = res.data.data.map(fav => fav.book.id);
          setFavoriteIds(currentFavIds);
        } catch (err) {
          console.error("خطأ في جلب المفضلة", err);
        }
      }

      const savedQuery = sessionStorage.getItem('last_search_query');
      const savedResults = sessionStorage.getItem('last_search_results');

      if (savedQuery && savedResults) {
        setSearchQuery(savedQuery);
        setBooks(JSON.parse(savedResults));
        setLoading(false);

        setTimeout(() => {
          const booksSection = document.getElementById('books-section');
          if (booksSection) {
            booksSection.scrollIntoView({ behavior: 'auto', block: 'start' });
          }
        }, 100);
      } else {
        fetchBooks();
      }
    };

    initPageData();
  }, [fetchBooks, fetchUserData, fetchLeaderboard]);
const handleSearch = async (e) => {
  const value = e.target.value;
  setSearchQuery(value);

  // 1. التمرير التلقائي لقسم الكتب عند بدء الكتابة
  if (value.trim().length > 0) {
    const booksSection = document.getElementById('books-section');
    if (booksSection) {
      booksSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // 2. إذا تم مسح مربع البحث، احذف التخزين المؤقت وأعد جلب كل الكتب
  if (value.trim() === '') {
    sessionStorage.removeItem('last_search_query');
    sessionStorage.removeItem('last_search_results');
    fetchBooks(); 
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    // 3. جلب كل الكتب من الرابط المتوفر بالباك إند
    const response = await axios.get(
      `http://localhost:8000/api/books`, 
      config
    );

    if (response.data.success) {
      const allBooks = response.data.data;
      const query = value.toLowerCase().trim();
      
      // 4. الفلترة الفائقة (اسم، كاتب، تصنيف، ونوع الوصول)
      const filtered = allBooks.filter(book => {
        // أ. فحص العنوان والمؤلف
        const matchesTitle = book.title && book.title.toLowerCase().includes(query);
        const matchesAuthor = book.author && book.author.toLowerCase().includes(query);
        
        // ب. فحص التصنيفات
        const matchesGenre = book.geners && book.geners.some(gener => 
          gener.name && gener.name.toLowerCase().includes(query)
        );

        // ج. فحص نوع الوصول (مجاني، مدفوع، مشروط، تجريبي) بناءً على الكلمة المكتوبة
        let matchesAccess = false;
        if (book.access_type) {
          const accessType = book.access_type.toLowerCase();
          
          if (query === 'مجاني' || query === 'مجاني الاصلي' || query === 'free') {
            matchesAccess = accessType === 'free';
          } else if (query === 'مدفوع' || query === 'paid') {
            matchesAccess = accessType === 'paid' || accessType === 'مدفوع'; 
          } else if (query === 'مشروط' || query === 'شرط') {
            // إذا كان الوصول مشروط بعدد كتب معينة
            matchesAccess = accessType === 'conditional' || book.required_books_read > 0;
          } else if (query === 'تجريبي' || query === 'trial') {
            matchesAccess = accessType === 'trial';
          } else {
            // فحص عادي إذا كتب جزء من الكلمة المخرنة في السيرفر
            matchesAccess = accessType.includes(query);
          }
        }

        // إرجاع الكتاب إذا تطابق مع أي شرط من الشروط الأربعة
        return matchesTitle || matchesAuthor || matchesGenre || matchesAccess;
      });

      // 5. تحديث قائمة الكتب المعروضة وحفظها مؤقتاً
      setBooks(filtered);
      sessionStorage.setItem('last_search_query', value);
      sessionStorage.setItem('last_search_results', JSON.stringify(filtered));
    }
  } catch (error) {
    console.error("خطأ في الفلترة الشاملة:", error);
  }
};
  const handleToggleFavorite = async (bookId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setOpenAuthModal(true);
      return;
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const isFav = favoriteIds.includes(bookId);

    try {
      if (isFav) {
        const res = await axios.delete(`http://localhost:8000/api/delete_favorites/${bookId}`, config);
        if (res.data.success) {
          setFavoriteIds(prev => prev.filter(id => id !== bookId));
        }
      } else {
        const res = await axios.post('http://localhost:8000/api/add_favorites', { book_id: bookId }, config);
        if (res.data.success) {
          setFavoriteIds(prev => [...prev, bookId]);
        }
      }
    } catch (err) {
      console.error("خطأ في تحديث المفضلة:", err);
    }
  };

  const handleAuthSuccess = () => {
    setOpenAuthModal(false);
    fetchUserData(); 
    if (pendingPdf) {
      window.open(pendingPdf, '_blank');
      setPendingPdf(null);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#EFEDE1', scrollBehavior: 'smooth' }}>      
      <Navbar 
        user={user}
        setUser={setUser}
        searchQuery={searchQuery} 
        handleSearch={handleSearch} 
        mainColor={mainColor} 
      />

      {/* 1. استدعاء قسم السلايدر الترحيبي */}
      <HeroSection mainColor={mainColor} />

      {/* 2. استدعاء قسم لوحة المتصدرين */}
      <LeaderboardSection 
        leaderboard={leaderboard}
        token={token}
        currentUserId={currentUserId}
        navigate={navigate}
        mainColor={mainColor}
      />

      {/* 3. قسم المكتبة الرقمية */}
      <Container id="books-section" sx={{ mt: 5, position: 'relative', zIndex: 5, pb: 10 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Cairo', textAlign: 'center', mb: 4, color: mainColor, fontWeight: 'bold' }}>
          المكتبة الرقمية
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress sx={{ color: mainColor }} />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ p: 2 }}>
              {books.slice(0, visibleBooks).map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  mainColor={mainColor}  
                  onToggleFavorite={handleToggleFavorite} 
                  isFavorite={favoriteIds.includes(book.id)} 
                />
              ))}
            </Grid>

            {books.length > visibleBooks && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setVisibleBooks(prev => prev + 8)} 
                  sx={{ 
                    fontFamily: 'Cairo', color: mainColor, borderColor: mainColor, px: 4, borderRadius: 2,
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

      {/* مودال تسجيل الدخول */}
      <Modal open={openAuthModal} onClose={() => setOpenAuthModal(false)}>
        <Fade in={openAuthModal}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', md: '750px' }, bgcolor: 'background.paper', borderRadius: 4, overflow: 'hidden', outline: 'none' }}>
            <Auth onSuccess={handleAuthSuccess} onClose={() => setOpenAuthModal(false)} />
          </Box>
        </Fade>
      </Modal>

    </Box>
  );
};

export default MainPage;