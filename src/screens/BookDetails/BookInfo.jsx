import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Rating, CardMedia, Button, Dialog, Chip, Snackbar, Alert } from '@mui/material'; 
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalOfferIcon from '@mui/icons-material/LocalOffer'; 
import Auth from '../../screens/Auth';

const BookInfo = ({ selectedBook, mainColor, handleReadClick, onPayClick }) => {
  const [openAuthPopup, setOpenAuthPopup] = useState(false);
  
  // 🌟 تعديل الـ State ليتناسب مع أي نوع رسالة (تحذير أو تنبيه قفل)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'warning' });

  // دالة مساعدة لفحص حالة قفل الكتاب ومحتواه
  const isBookLocked = selectedBook && !selectedBook.pdf_path;
  const isPaidBook = selectedBook?.price && Number(selectedBook.price) > 0;

  // دالة موحدة لإظهار رسالة التنبيه بناءً على نوع القفل
  const showLockMessage = () => {
    if (isPaidBook) {
      setToast({
        open: true,
        message: "عذراً، هذا الكتاب مدفوع. يرجى فتح الكتاب أولاً لتتمكن من التفاعل معه (التقييم، التعليق، الإضافة).",
        severity: 'info'
      });
    } else {
      setToast({
        open: true,
        message: selectedBook.lock_message || "هذا الكتاب مقفل حالياً، يرجى استيفاء الشروط لفتحه لتبدأ بالتفاعل معه.",
        severity: 'warning'
      });
    }
  };

  const onReadButtonClick = () => {
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
      setOpenAuthPopup(true);
      return;
    }

    if (selectedBook) {
      if (isBookLocked) {
        // 1️⃣ إذا كان الكتاب مدفوعاً وله سعر حقيقي في الباكيند
        if (isPaidBook) {
          if (onPayClick) onPayClick(); 
        } 
        // 2️⃣ إذا كان كتاب مشروط
        else {
          setToast({
            open: true,
            message: selectedBook.lock_message || "هذا الكتاب مقفل حالياً، يرجى استيفاء الشروط لفتحه.",
            severity: 'warning'
          });
        }
        return;
      }

      if (handleReadClick) {
        handleReadClick(selectedBook.pdf_path);
      }
    }
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast({ ...toast, open: false });
  };

  const categories = selectedBook?.geners || selectedBook?.genres || [];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 3, sm: 4 }, borderRadius: '24px', border: '3px solid #602134', bgcolor: '#f4f1ea', mb: 4,
        boxShadow: '0 10px 30px rgba(84, 16, 41, 0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
      }}
    >
      {/* غلاف الكتاب */}
      <Box sx={{ 
        width: '180px', borderRadius: '14px', aspectRatio: '2/3', mb: 3, border: `3px solid ${mainColor}`, 
        p: '4px', bgcolor: '#fff', transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)', '&:hover': { transform: 'translateY(-10px)', boxShadow: `0 15px 30px rgba(84, 16, 41, 0.2)` }
      }}>
        <CardMedia 
          component="img" image={selectedBook?.cover_img} alt={selectedBook?.title}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} 
        />
      </Box>

      {/* عنوان الكتاب */}
      <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Cairo', color: '#1a1a1a', mb: 1.5, fontSize: { xs: '1.6rem', sm: '2rem' } }}>
        {selectedBook?.title}
      </Typography>
      
      {/* الكاتب والتقييم */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: mainColor }}>
          <PersonIcon sx={{ fontSize: '1.2rem' }} />
          <Typography variant="body1" sx={{ fontFamily: 'Cairo', fontWeight: 700 }}>
            {selectedBook?.author}
          </Typography>
        </Box>

        {/* 🌟 تعديل قسم التقييم: إذا كان مغلقاً وضغط عليه المستخدم تظهر الرسالة التوضيحية */}
        <Box 
          onClick={isBookLocked ? showLockMessage : undefined}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, direction: 'ltr', cursor: isBookLocked ? 'pointer' : 'default' }}
        >
          <Rating 
            value={selectedBook?.average_rating ? Number(Number(selectedBook.average_rating).toFixed(1)) : 0} 
            readOnly 
            precision={0.1} 
            size="small" 
          />
          <Typography variant="body2" sx={{ fontFamily: 'Cairo', fontWeight: 700, color: '#ffb400', mt: 0.2 }}>
            {selectedBook?.average_rating ? Number(selectedBook.average_rating).toFixed(1) : "0.0"}
          </Typography>
        </Box>
      </Box>

      {/* صندوق الوصف */}
      <Box sx={{ width: '100%', bgcolor: '#fbf9f5', p: { xs: 2.5, sm: 3 }, borderRadius: '16px', border: '1px solid #f3eee3', mb: 2 }}>
        <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 1.8, color: '#444', textAlign: 'justify' }}>
          {selectedBook?.description || "لا يوجد وصف متاح لهذا الكتاب حالياً في منصة جليس."}
        </Typography>
      </Box>

      {/* 🏷️ قسم التصنيفات */}
      {categories.length > 0 && (
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1, flexWrap: 'wrap', mb: 3, px: 1, direction: 'rtl' }}>
          <LocalOfferIcon sx={{ fontSize: '1rem', color: '#888', ml: 1 }} />
          {categories.map((category, index) => (
            <Chip 
              key={index}
              label={typeof category === 'object' ? category.name : category} 
              sx={{
                fontFamily: 'Cairo', fontWeight: 600, fontSize: '0.85rem',
                bgcolor: '#eadecd', color: '#541029', border: '1px solid #dcd1be', borderRadius: '8px',
                '&:hover': { bgcolor: '#dfd3be' }
              }}
            />
          ))}
        </Box>
      )}

      {/* شريط الإجراءات السفلي */}
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid #f0eae0', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#666' }}>
          <MenuBookIcon sx={{ fontSize: '1.2rem', color: mainColor }} />
          <Typography variant="body2" sx={{ fontFamily: 'Cairo', fontWeight: 600 }}>
            عدد الصفحات: {selectedBook?.pages || "غير محدد"}
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          onClick={onReadButtonClick}
          sx={{ 
            bgcolor: !isBookLocked ? mainColor : '#888', 
            fontFamily: 'Cairo', 
            fontWeight: 700, 
            borderRadius: '50px', 
            px: 5, 
            py: 1.2, 
            transition: 'all 0.3s',
            '&:hover': { bgcolor: !isBookLocked ? mainColor : '#777', opacity: 0.95, transform: 'scale(1.03)' },
            boxShadow: `0 0 0 0 rgba(84, 16, 41, 0.4)`, 
            animation: !isBookLocked ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': { '0%': { boxShadow: `0 0 0 0 rgba(84, 16, 41, 0.4)` }, '70%': { boxShadow: `0 0 0 12px rgba(84, 16, 41, 0)` }, '100%': { boxShadow: `0 0 0 0 rgba(84, 16, 41, 0)` } }
          }}
        >
          {!isBookLocked ? "ابدأ قراءة الكتاب الآن" : isPaidBook ? "🔒 شراء الكتاب المقفل" : "🔒 فتح الكتاب المشروط"}
        </Button>
      </Box>

      {/* 🌟 نافذة الـ Popup العائمة للـ Auth */}
      <Dialog 
        open={openAuthPopup} 
        onClose={() => setOpenAuthPopup(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
      >
        <Auth 
          onClose={() => setOpenAuthPopup(false)} 
          onSuccess={() => {
            setOpenAuthPopup(false);
            window.location.reload(); 
          }} 
        />
      </Dialog>

      {/* 🌟 رسالة الـ Snackbar الذكية والموحدة */}
      <Snackbar 
        open={toast.open} 
        autoHideDuration={5000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} 
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity} 
          variant="filled"
          sx={{ width: '100%', fontFamily: 'Cairo', borderRadius: '10px' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

    </Paper>
  );
};

export default BookInfo;