import React from 'react';
import { styled, keyframes } from '@mui/system';

const moveForever = keyframes`
  0% { transform: translate3d(-90px, 0, 0); }
  100% { transform: translate3d(85px, 0, 0); }
`;

const WaveContainer = styled('div')({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  height: '90px', // ارتفاع منطقة الأمواج
  minHeight: '100px',
  maxHeight: '150px',
});

const EditorialWaves = styled('svg')({
  position: 'relative',
  width: '100%',
  height: '90px',
  marginBottom: '-7px', /* لإزالة أي فراغ أسفل الـ SVG */
  minHeight: '100px',
});

/* تنسيق حركات الطبقات */
const ParallaxLayer = styled('g')(({ delay, duration }) => ({
  '& use': {
    animation: `${moveForever} ${duration} cubic-bezier(.55,.5,.45,.5) infinite`,
    animationDelay: delay,
  }
}));

const Waves = () => {
  const color = "#541029"; // لونك الأساسي

  return (
    <WaveContainer>
      <EditorialWaves viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
        </defs>
        <g className="parallax">
          {/* الطبقة 1: شفافة جداً وأبطأ شيء */}
          <ParallaxLayer delay="-2s" duration="15s">
            <use xlinkHref="#gentle-wave" x="48" y="0" fill={`rgba(84, 16, 41, 0.3)`} />
          </ParallaxLayer>
          {/* الطبقة 2: متوسطة الشفافية */}
          <ParallaxLayer delay="-3s" duration="12s">
            <use xlinkHref="#gentle-wave" x="48" y="3" fill={`rgba(84, 16, 41, 0.5)`} />
          </ParallaxLayer>
          {/* الطبقة 3: أغمق وقريبة من اللون الأصلي */}
          <ParallaxLayer delay="-4s" duration="9s">
            <use xlinkHref="#gentle-wave" x="48" y="5" fill={`rgba(84, 16, 41, 0.7)`} />
          </ParallaxLayer>
          {/* الطبقة 4: اللون الصلب الذي يندمج مع الخلفية تحت (أبيض أو رمادي فاتح) */}
          <ParallaxLayer delay="-2s" duration="10s">
            <use xlinkHref="#gentle-wave" x="48" y="7" fill="#EFEDE1" />
          </ParallaxLayer>
        </g>
      </EditorialWaves>
    </WaveContainer>
  );
};

export default Waves;