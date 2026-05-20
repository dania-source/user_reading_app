import React from 'react';
import { Box } from '@mui/material';

const FlyingBooks = () => {
  const bookIcons = ['📚', '📖', '📕', '📘', '✨'];
  
  const books = Array.from({ length: 12 }).map((_, index) => {
    const size = Math.random() * (35 - 15) + 15; 
    const startLeft = Math.random() * 100; 
    const delay = Math.random() * 8; 
    const duration = Math.random() * (18 - 10) + 10; 
    const icon = bookIcons[Math.floor(Math.random() * bookIcons.length)];

    return { index, size, startLeft, delay, duration, icon };
  });

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 1, 
        pointerEvents: 'none', 
      }}
    >
      {books.map((book) => (
        <Box
          key={book.index}
          sx={{
            position: 'absolute',
            bottom: '-50px', 
            left: `${book.startLeft}%`,
            fontSize: `${book.size}px`,
            opacity: 0,
            filter: 'drop-shadow(0px 0px 8px rgba(255,215,0,0.4))', 
            animation: `flyUp ${book.duration}s linear infinite`,
            animationDelay: `${book.delay}s`,
            '@keyframes flyUp': {
              '0%': {
                transform: 'translateY(0) rotate(0deg) scale(0.5)',
                opacity: 0,
              },
              '10%': {
                opacity: 0.6,
              },
              '90%': {
                opacity: 0.6,
              },
              '100%': {
                transform: 'translateY(-110vh) rotate(360deg) scale(1.2)',
                opacity: 0,
              },
            },
          }}
        >
          {book.icon}
        </Box>
      ))}
    </Box>
  );
};
export default FlyingBooks;