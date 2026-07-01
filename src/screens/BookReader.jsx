import React from 'react';
import { Dialog, Box, Button, Typography } from '@mui/material';

const BookReader = ({ isReading, setIsReading, currentPage, setCurrentPage, currentBook, mainColor, handlePageChange, onPayClick }) => {
  
  // 🔍 الفحص الحاسم: هل تخطى العداد الحالي الحد التجريبي المسموح بالباكيند؟
  const isTrialExceeded = currentBook?.access_type === 'trial' && currentPage > (currentBook?.trial_pages || 0);

  return (
    <Dialog 
      fullScreen 
      open={isReading} 
      onClose={() => setIsReading(false)}
    >
      <Box sx={{ p: 2, bgcolor: '#f4f1ea', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', direction: 'rtl' }}>
        
        {/* شريط التحكم العلوي */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <Button variant="contained" onClick={() => setIsReading(false)} sx={{ bgcolor: mainColor, fontFamily: 'Cairo' }}>
            إغلاق القراءة
          </Button>
          <Typography variant="h6" sx={{ fontFamily: 'Cairo' }}>
            صفحة: {currentPage} من {currentBook?.pages || "غير محدد"}
          </Typography>
        </Box>

        {/* منطقة العرض الذكية والمربوطة بالباكيند */}
        <Box sx={{ width: '100%', maxWidth: '800px', flexGrow: 1, bgcolor: '#fff', boxShadow: 3, borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          
{isTrialExceeded ? (
  /* 🔒 كرت حجب الكتاب ورسالة الدفع المعتمدة على الباكيند */
  <Box sx={{ textAlign: 'center', p: 4 }}>
    <Typography variant="h5" sx={{ fontFamily: 'Cairo', color: mainColor, mb: 3, fontWeight: 'bold' }}>
      🔒 عذراً، لقد وصلت إلى الحد التجريبي المسموح به لهذا الكتاب!
    </Typography>
    <Typography sx={{ fontFamily: 'Cairo', color: 'gray', mb: 4 }}>
      لمتابعة القراءة، يرجى إتمام عملية الشراء لفتح الكتاب بالكامل.
    </Typography>
    <Button 
      variant="contained" 
      onClick={() => {
        setIsReading(false);
        if (onPayClick) onPayClick();
      }}
      sx={{ bgcolor: mainColor, fontFamily: 'Cairo', px: 4, py: 1.5, fontSize: '16px' }}
    >
      شراء الكتاب الآن
    </Button>
  </Box>
) : (
  /* 📖 الحاوية السحرية التي تمنع السكرول وتقص بقية صفحات الكتاب تماماً */
  currentBook?.pdf_path ? (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative', 
        /* 1. منع أي ظهور لأشرطة التمرير الخاصة بالمتصفح */
        overflow: 'hidden', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}
    >
      <iframe
        key={currentPage} 
        src={`${currentBook.pdf_path}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0`}
        title={currentBook?.title}
        width="100%"
        height="100%"
        style={{ 
          border: 'none',
          /* 2. إلغاء تفاعل الماوس أو عجلة السكرول داخل الـ iframe تماماً */
          pointerEvents: 'none', 
          position: 'absolute',
          top: 0,
          left: 0
        }}
      />
      
      {/* 3. طبقة شفافة فوق الـ iframe لضمان امتصاص أي نقرات أو محاولات سكرول بالأسهم */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 10, 
          bgcolor: 'transparent' 
        }} 
      />
    </Box>
  ) : (
    <Typography sx={{ textAlign: 'center', fontFamily: 'Cairo', color: 'red' }}>
      {currentBook?.lock_message || "عذراً، ملف الكتاب غير متوفر حالياً."}
    </Typography>
  )
)}
        </Box>

        {/* أزرار التحكم السفلي */}
        <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
          <Button 
            variant="outlined" 
            disabled={currentPage <= 1 || isTrialExceeded} 
            onClick={() => setCurrentPage(prev => prev - 1)}
            sx={{ fontFamily: 'Cairo' }}
          >
            الصفحة السابقة
          </Button>
          
          <Button 
            variant="contained" 
            disabled={isTrialExceeded || currentPage >= (currentBook?.pages || 1000)} 
            onClick={() => handlePageChange(currentPage + 1)} // عند الضغط، يستدعي الباكيند فوراً
            sx={{ bgcolor: mainColor, fontFamily: 'Cairo' }}
          >
            الصفحة التالية
          </Button>
        </Box>

      </Box>
    </Dialog>
  );
};

export default BookReader;