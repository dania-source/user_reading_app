import React from 'react';
import { Box, Button, Typography, Dialog } from '@mui/material';

// 🔥 أضفنا هنا bookId ضمن الـ props المستلمة من الأب
const PDFReader = ({ open, onClose, pdfUrl, bookTitle, bookId, onPageChange }) => {
  
  // تعريف الـ URL الخاص بالباكيند بشكل مباشر داخل الملف لتجنب خطأ التعريف
  const BACKEND_API_URL = "http://127.0.0.1:8000/api"; 

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#333' }}>
        
        {/* شريط التحكم العلوي */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1a1a1a', color: '#fff' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Cairo' }}>
            قراءة: {bookTitle}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="success"
              onClick={onPageChange} 
              sx={{ fontFamily: 'Cairo', fontWeight: 700 }}
            >
              أنهيت قراءة صفحة ومتابعة ✅
            </Button>

            <Button variant="outlined" color="error" onClick={onClose} sx={{ fontFamily: 'Cairo' }}>
              إغلاق القارئ
            </Button>
          </Box>
        </Box>

        {/* عرض ملف الـ PDF عبر الـ show الخاص بالباكيند */}
        <Box sx={{ flexGrow: 1, width: '100%', height: 'calc(100% - 70px)', overflow: 'hidden' }}>
          {bookId ? (
            <iframe
              // الاستدعاء المباشر لتابع الـ show في الباكيند لكي يطبق الـ limit الخاص بالمدير
              src={`${BACKEND_API_URL}/books/${bookId}?token=${localStorage.getItem('token')}`}
              title="جليس قارئ الكتب"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          ) : (
            <Typography color="error" sx={{ p: 3 }}>يتعذر تحميل ملف الكتاب...</Typography>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};

export default PDFReader;