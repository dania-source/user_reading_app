import React from 'react';
import { Grid, Card, CardMedia, CardContent, Typography, Box, Button, IconButton } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material'; // استيراد أيقونات القلب

const BookCard = ({ book, onOpenDetails, onToggleFavorite, isFavorite, mainColor }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      borderRadius: 3, 
      position: 'relative', // ضروري لوضع أيقونة القلب في زاوية الكرت
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: '0.3s', 
      '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' } 
    }}>
      
      {/* زر المفضلة (أيقونة القلب) */}
      <IconButton 
        onClick={(e) => {
          e.stopPropagation(); // لمنع تداخل الضغطة مع كرت الكتاب
          onToggleFavorite(book.id);
        }}
        sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          bgcolor: 'rgba(255, 255, 255, 0.7)', // خلفية شفافة لجعل القلب واضحاً
          backdropFilter: 'blur(4px)',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
          zIndex: 2 // لضمان بقائه فوق الصورة
        }}
      >
        {isFavorite ? (
          <Favorite sx={{ color: '#e91e63' }} /> // قلب ممتلئ إذا كان مفضلاً
        ) : (
          <FavoriteBorder sx={{ color: '#555' }} /> // قلب فارغ إذا لم يكن مفضلاً
        )}
      </IconButton>

      <CardMedia 
        component="img" 
        image={book.cover_img} 
        sx={{ height: 280, objectFit: 'fill', bgcolor: '#f5f5f5' }} 
      />

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
          onClick={() => onOpenDetails(book.id)} 
          sx={{ bgcolor: mainColor, fontFamily: 'Cairo', borderRadius: 1.5, '&:hover': { bgcolor: '#3d0b1e' } }}
        >
          تفاصيل الكتاب
        </Button>
      </Box>
    </Card>
  </Grid>
);

export default BookCard;