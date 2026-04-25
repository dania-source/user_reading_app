import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Grid, CircularProgress, Typography, Modal, Fade } from '@mui/material';
import axios from 'axios';
import Waves from './Waves';
import Auth from './Auth';
import Navbar from './Navbar'; 
import BookCard from './BookCard';
import BookDetailsModal from './BookDetailsModal';

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
  
  // الحالة الجديدة لحفظ بيانات المستخدم
  const [user, setUser] = useState(null);

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
    if (value.trim() === '') { fetchBooks(); return; }
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(`http://localhost:8000/api/books/search?title=${value}`, config);
      if (response.data.success) setBooks(response.data.data);
    } catch (error) { console.error("خطأ في البحث:", error); }
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#EFEDE1' }}>
      
      {/* تمرير بيانات المستخدم للـ Navbar */}
      <Navbar 
        searchQuery={searchQuery} 
        handleSearch={handleSearch} 
        mainColor={mainColor} 
        user={user} 
      />

      {/* Hero Section */}
      <Box sx={{ position: 'relative', background: `linear-gradient(180deg, ${mainColor} 0%, #821c3e 100%)`, pt: 20, pb: 30, textAlign: 'center', color: 'white' }}>
        <Container sx={{ position: 'relative', zIndex: 2 }}>
          <Typography variant="h2" fontWeight="bold" sx={{ fontFamily: 'Cairo' }}>عالم القراءة</Typography>
        </Container>
        <Waves />
      </Box>

      {/* Books Grid */}
      <Container sx={{ mt: -12, position: 'relative', zIndex: 5, pb: 10 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress sx={{ color: mainColor }} /></Box>
        ) : (
          <Grid container spacing={3} sx={{ p: 2 }}>
            {books.map((book) => (
              <BookCard key={book.id} book={book} onOpenDetails={handleOpenDetails} mainColor={mainColor} />
            ))}
          </Grid>
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