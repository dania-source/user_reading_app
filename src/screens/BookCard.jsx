import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardMedia, CardContent, Typography, Box, Button, IconButton, Chip } from '@mui/material';
import { Favorite, FavoriteBorder, Lock, AttachMoney, AutoStories, CardGiftcard } from '@mui/icons-material';

const BookCard = ({ book, onToggleFavorite, isFavorite, mainColor }) => {
  const navigate = useNavigate();

  // دالة لمساعدة في عرض نوع الوصول بشكل منسق واحترافي
  const renderAccessBadge = () => {
    switch (book.access_type) {
      case 'paid': // أو حسب القيمة النصية المرسلة من الباك إيند لـ مدفوع
        return <Chip icon={<Lock style={{ color: '#fff', fontSize: 16 }} />} label={`مدفوع: ${book.price}$`} sx={{ bgcolor: '#e65100', color: '#fff', fontFamily: 'Cairo', fontWeight: 'bold' }} size="small" />;
      case 'trial': // تجريبي
        return <Chip icon={<AutoStories style={{ color: '#fff', fontSize: 16 }} />} label={`تجريبي (${book.trial_pages} صفحة)`} sx={{ bgcolor: '#0288d1', color: '#fff', fontFamily: 'Cairo' }} size="small" />;
      case 'conditional': // مشروط بعدد كتب منهية
        return <Chip icon={<Lock style={{ color: '#fff', fontSize: 16 }} />} label={`يتطلب قراءة ${book.required_books_read} كتب`} sx={{ bgcolor: '#7b1fa2', color: '#fff', fontFamily: 'Cairo' }} size="small" />;
      case 'free':
      default: // مجاني
        return <Chip icon={<CardGiftcard style={{ color: '#fff', fontSize: 16 }} />} label="مجاني" sx={{ bgcolor: '#2e7d32', color: '#fff', fontFamily: 'Cairo' }} size="small" />;
    }
  };

  return (
    <Grid item xs={12} sm={6} md={3}>
      <Card sx={{ 
        height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, position: 'relative',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: '0.3s', 
        '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' } 
      }}>
        
        {/* شارة نوع الوصول (أعلى اليسار) */}
        <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 2 }}>
          {renderAccessBadge()}
        </Box>

        {/* زر المفضلة (أعلى اليمين) */}
        <IconButton 
          onClick={(e) => {
            e.stopPropagation(); 
            onToggleFavorite(book.id);
          }}
          sx={{ 
            position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(4px)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }, zIndex: 2 
          }}
        >
          {isFavorite ? <Favorite sx={{ color: '#e91e63' }} /> : <FavoriteBorder sx={{ color: '#555' }} />}
        </IconButton>

        <CardMedia component="img" image={book.cover_img} sx={{ height: 280, objectFit: 'fill', bgcolor: '#f5f5f5' }} />

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center', p: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: 'Cairo', fontSize: '1.1rem', mb: 0.5, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {book.title}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo', mb: 1 }}>
              تأليف: {book.author}
            </Typography>
          </Box>
        </CardContent>

        <Box sx={{ p: 2, pt: 0 }}>
          <Button 
            fullWidth 
            variant="contained" 
            onClick={() => navigate(`/book/${book.id}`, { state: { book } })} 
            sx={{ bgcolor: mainColor, fontFamily: 'Cairo', borderRadius: 1.5, '&:hover': { bgcolor: '#3d0b1e' } }}
          >
            تفاصيل الكتاب
          </Button>
        </Box>
      </Card>
    </Grid>
  );
};

export default BookCard;