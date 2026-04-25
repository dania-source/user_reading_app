import React from 'react';
import { Modal, Fade, Backdrop, Box, CircularProgress, CardMedia, IconButton, Typography, Rating, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const BookDetailsModal = ({ open, handleClose, selectedBook, detailsLoading, mainColor, handleReadClick }) => (
  <Modal open={open} onClose={handleClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
    <Fade in={open}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: { xs: '95%', md: 850 }, maxHeight: '90vh', bgcolor: 'background.paper',
        borderRadius: 4, overflow: 'hidden', display: 'flex', flexDirection: { xs: 'column', md: 'row' },
        boxShadow: 24, outline: 'none'
      }}>
        {detailsLoading ? (
          <Box sx={{ p: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <CircularProgress sx={{ color: mainColor }} />
          </Box>
        ) : selectedBook && (
          <>
            <Box sx={{ width: { xs: '100%', md: '45%' }, height: { xs: 250, md: 'auto' } }}>
              <CardMedia component="img" image={selectedBook.cover_img} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
            <Box dir="rtl" sx={{ width: { xs: '100%', md: '55%' }, p: 4, position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <IconButton onClick={handleClose} sx={{ position: 'absolute', left: 8, top: 8, color: mainColor }}>
                <CloseIcon />
              </IconButton>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'Cairo', color: mainColor }}>{selectedBook.title}</Typography>
              <Typography variant="h6" color="textSecondary" sx={{ mb: 2, fontFamily: 'Cairo' }}>الكاتب: {selectedBook.author}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <Rating value={selectedBook.average_rating} readOnly precision={0.5} />
                <Typography sx={{ fontWeight: 'bold' }}>{selectedBook.average_rating} / 5</Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 3, maxHeight: '200px', overflowY: 'auto', fontFamily: 'Cairo', lineHeight: 1.8, color: '#444' }}>
                {selectedBook.description || "لا يوجد وصف متاح."}
              </Typography>
              <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', pt: 2 }}>
                <Typography variant="body2" sx={{ fontFamily: 'Cairo' }}>عدد الصفحات: <b>{selectedBook.pages}</b></Typography>
                <Button variant="contained" onClick={() => handleReadClick(selectedBook.pdf_path)} sx={{ bgcolor: mainColor, px: 4, fontFamily: 'Cairo', borderRadius: 2 }}>
                  قراءة الكتاب
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Fade>
  </Modal>
);

export default BookDetailsModal;