import React from 'react';
import { Grid, Card, CardMedia, CardContent, Typography, Box, Button } from '@mui/material';

const BookCard = ({ book, onOpenDetails, mainColor }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      borderRadius: 3, 
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: '0.3s', 
      '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' } 
    }}>
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