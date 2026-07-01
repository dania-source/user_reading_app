import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import MagicParticles from './MagicParticles';
import Waves from './Waves';

import 'swiper/css';
import 'swiper/css/pagination';

const slidesData = [
  {
    title: "انطلِق في تحدي العمر",
    desc: "في منصة جَليس، القراءة ليست مجرد هواية، بل هي رحلة مليئة بالتحديات والمغامرات الشيّقة بين صفحات الكتب. ابدأ كتابك الأول اليوم!",
    image: "/images/reading_girl_cartoon.png"
  },
  {
    title: "تسيّد جدول المتصدرين",
    desc: "نافِس قُرّاء العالم العربي، اجمع النقاط مع كل صفحة تقلبها، واعتلِ صدارة القائمة لتثبت للجميع أنك القارئ الأفضل في نخبة القراء.",
    image: "/images/thinking_girl_cartoon.png"
  },
  {
    title: "اكسب ألقاباً تليق بشغفك",
    desc: "من 'قارئ مبتدئ' إلى 'الحكيم' و'المثقف اللامع'؛ حوّل قراءاتك إلى ألقاب وإنجازات تفتخر بها. كل كتاب تقرأه يمنحك وِساماً جديداً!",
    image: "/images/waving_girl_cartoon.png"
  }
];

const HeroSection = ({ mainColor }) => {
  return (
    <Box
      id="home-section"
      sx={{
        position: 'relative',
        background: `linear-gradient(-45deg, ${mainColor}, #821c3e, #5a1228, #3b0a18)`,
        backgroundSize: '400% 400%',
        animation: 'gradientAnimation 12s ease infinite',
        pt: { xs: 8, md: 12 }, 
        pb: { xs: 18, md: 22 }, 
        textAlign: 'center',
        color: 'white',
        overflow: 'hidden',
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
        '@keyframes gradientAnimation': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        '& .swiper-pagination-bullet': {
          background: '#FFF',
          opacity: 0.4,
          width: '10px',
          height: '10px',
          transition: 'all 0.3s ease',
        },
        '& .swiper-pagination-bullet-active': {
          background: '#F3C5C7',
          width: '24px',
          borderRadius: '5px',
          opacity: 1,
        },
        '& .swiper-pagination': {
          bottom: '60px !important', 
          zIndex: 10,
        }
      }}
    >
      <MagicParticles />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, animation: 'fadeInUp 1.2s ease-out forwards' }}>
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          style={{ width: '100%' }}
        >
          {slidesData.map((slide, index) => (
            <SwiperSlide key={index}>
              <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between', direction: 'rtl', minHeight: '400px' }}>
                
                <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
                  <Box sx={{ p: { xs: 2, md: 0 }, transform: { xs: 'none', md: 'translateY(-70px)' }, transition: 'transform 0.3s ease' }}>
                    <Typography
                      variant="h1"
                      fontWeight="900"
                      sx={{
                        fontFamily: 'Cairo, sans-serif',
                        mb: 2, 
                        fontSize: { xs: '2.2rem', md: '3.8rem' },
                        background: 'linear-gradient(45deg, #FFF 30%, #F3C5C7 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {slide.title}
                    </Typography>

                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Cairo, sans-serif',
                        opacity: 0.9,
                        lineHeight: 1.8,
                        fontSize: { xs: '1rem', md: '1.25rem' },
                        color: '#F5F5F7',
                        maxWidth: '500px', 
                        marginRight: 0,
                        marginLeft: 'auto'
                      }}
                    >
                      {slide.desc}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, alignItems: 'center' }}>
                  <Box
                    component="img"
                    src={slide.image} 
                    alt={slide.title}
                    sx={{
                      width: '100%',
                      maxWidth: { xs: '220px', md: '350px' }, 
                      height: 'auto',
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'scale(1.05)' },
                      transform: index === 0 ? { md: 'translateX(-20px)' } : 'none',
                    }}
                  />
                </Grid>

              </Grid>
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>

      <Waves />
    </Box>
  );
};

export default HeroSection;