import React, { useState } from 'react';
import { Box, Paper, Typography, Rating, TextField, Button, Dialog, Avatar } from '@mui/material'; // 👈 أضفنا Avatar هنا
import Auth from '../../screens/Auth';

const AddCommentForm = ({ userRating, commentText, setCommentText, mainColor, handleRatingChange, handleAddComment }) => {
  // 🚪 حالة للتحكم بفتح وإغلاق نافذة تسجيل الدخول العائمة
  const [openAuthPopup, setOpenAuthPopup] = useState(false);

  // 🔍 فحص هل المستخدم مسجل دخول أم لا
  const isLoggedIn = Boolean(localStorage.getItem('user_id'));

  // 🖼️ جلب رابط صورة المستخدم واسمه من الـ localStorage (تأكد من مطابقة المسميات لما تخزنه عندك)
  const userImage = localStorage.getItem('user_image'); 
  const userName = localStorage.getItem('user_name') || 'مستخدم';

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '3px solid #602134', bgcolor: '#f4f1ea', mb: 4 }}>
      
      {/* 👤 ترويسة النموذج: تحتوي على الصورة والعنوان */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar 
          src={isLoggedIn ? userImage : ''} // يعرض الصورة لو مسجل، أو أول حرف لو مش مسجل أو الصورة مش موجودة
          alt={userName}
          sx={{ 
            width: 45, 
            height: 45, 
            border: `2px solid ${mainColor}`,
            bgcolor: mainColor, // لون خلفية افتراضي في حال عدم وجود صورة
            fontFamily: 'Cairo'
          }}
        >
          {/* حل بديل: إذا لم تتوفر صورة، يظهر أول حرف من اسمه */}
          {userName.charAt(0).toUpperCase()}
        </Avatar>
        
        <Typography variant="subtitle2" sx={{ fontFamily: 'Cairo', fontWeight: 700, color: '#1a1a1a' }}>
          {isLoggedIn ? `مرحباً ${userName}، شارك القراء انطباعك:` : 'شارك القراء انطباعك:'}
        </Typography>
      </Box>
      
      {/* التقييم بالنجوم */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, opacity: isLoggedIn ? 1 : 0.6 }}>
        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#555' }}>تقييمك الشخصي:</Typography>
        <Rating 
          value={userRating} 
          onChange={(event, newValue) => handleRatingChange(newValue)} 
          disabled={!isLoggedIn} // 🔒 يتم قفله إذا لم يسجل دخول
        />
      </Box>

      {/* حقل نص التعليق */}
      <TextField
        fullWidth multiline rows={3} placeholder={isLoggedIn ? "اكتب مراجعتك حول الكتاب هنا..." : "يجب تسجيل الدخول أولاً لتتمكن من كتابة مراجعة..."}
        value={commentText} onChange={(e) => setCommentText(e.target.value)}
        disabled={!isLoggedIn} // 🔒 يتم قفله إذا لم يسجل دخول
        slotProps={{ input: { style: { fontFamily: 'Cairo', fontSize: '0.95rem' } } }}
        sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: isLoggedIn ? '#fdfcfe' : '#f0ede5' } }}
      />

      {/* شريط التحكم السفلي والزر الذكي */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        {isLoggedIn ? (
          // ✅ إذا كان مسجل دخول: يظهر زر النشر الطبيعي
          <Button 
            variant="contained" 
            onClick={handleAddComment} 
            disabled={!commentText.trim()} 
            sx={{ bgcolor: mainColor, fontFamily: 'Cairo', fontWeight: 700, borderRadius: '50px', px: 4, '&:hover': { bgcolor: mainColor, opacity: 0.9 } }}
          >
            نشر المراجعة
          </Button>
        ) : (
          // 🔒 إذا مش مسجل دخول: تظهر رسالة دعوة لتسجيل الدخول بدلاً من قفل الزر بشكل صامت
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" sx={{ fontFamily: 'Cairo', color: '#777', fontWeight: 600 }}>
              لم تكتب انطباعك بعد؟
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => setOpenAuthPopup(true)} // فتح نافذة الدخول
              sx={{ borderColor: mainColor, color: mainColor, fontFamily: 'Cairo', fontWeight: 700, borderRadius: '50px', px: 3, '&:hover': { borderColor: mainColor, bgcolor: 'rgba(84, 16, 41, 0.04)' } }}
            >
              تسجيل الدخول للنشر
            </Button>
          </Box>
        )}
      </Box>

      {/* ======================================================== */}
      {/* 🌟 نافذة الـ Popup العائمة لتسجيل الدخول */}
      {/* ======================================================== */}
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
            window.location.reload(); // تحديث الصفحة لتفعيل الحقول فوراً بعد نجاح الدخول
          }} 
        />
      </Dialog>

    </Paper>
  );
};

export default AddCommentForm;