
import React from 'react';

const HeaderIllustration = () => {
  const hour = new Date().getHours();
  
  const getBannerContent = () => {
    if (hour < 12) {
      return {
        src: "/lovable-uploads/d922725d-2ebb-46aa-aed6-f28d6d151006.png",
        alt: "Good morning landscape with sun and hills"
      };
    } else if (hour < 18) {
      return {
        src: "/lovable-uploads/1011af21-48c7-4e0f-acea-e2052fe11364.png",
        alt: "Good afternoon scene with fox and butterfly"
      };
    } else {
      return {
        src: "/lovable-uploads/0ade6ca6-8bd6-4751-9b77-1aac333f5e94.png",
        alt: "Good evening scene with fox under moonlight"
      };
    }
  };

  const { src, alt } = getBannerContent();

  return (
    <div className="mb-8 rounded-3xl overflow-hidden relative">
      <img 
        src={src}
        alt={alt}
        className="w-full h-48 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-sprout-cream/80 to-transparent" />
    </div>
  );
};

export default HeaderIllustration;
