import React from 'react';
import { animated, useSpring } from '@react-spring/web';

const Carousel3D = ({ slides, goToSlide, offsetRadius }) => {
  // Calculate positions and transformations for each slide
  const getSlideStyles = (index) => {
    const offset = index - goToSlide;
    const dir = Math.sign(offset);
    const distance = Math.min(Math.abs(offset), offsetRadius);
    
    const xOffset = dir * distance * 50; // Controls horizontal spread
    const scale = 1 - (distance * 0.2); // Controls size reduction
    const opacity = 1 - (distance * 0.3); // Controls fade
    const zIndex = offsetRadius - distance;
    
    return {
      transform: `translateX(${xOffset}%) scale(${scale})`,
      opacity,
      zIndex,
    };
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full">
        {slides.map((slide, index) => {
          const styles = getSlideStyles(index);
          
          return (
            <animated.div
              key={slide.key}
              className="absolute top-0 left-0 w-full transition-all duration-300 ease-in-out"
              style={{
                ...styles,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                willChange: 'transform, opacity',
                pointerEvents: index === goToSlide ? 'auto' : 'none',
              }}
            >
              {slide.content}
            </animated.div>
          );
        })}
      </div>
      
      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === goToSlide ? 'bg-green-500 scale-125' : 'bg-gray-300'
            }`}
            onClick={() => setGoToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel3D;