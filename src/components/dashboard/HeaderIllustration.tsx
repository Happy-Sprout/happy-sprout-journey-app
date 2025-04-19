
import React from 'react';
import { useUser } from "@/hooks/useUser";

const HeaderIllustration = () => {
  const { getCurrentChild } = useUser();
  const currentChild = getCurrentChild();
  const hour = new Date().getHours();
  
  const getBannerContent = () => {
    if (hour < 12) {
      return {
        src: "/lovable-uploads/d922725d-2ebb-46aa-aed6-f28d6d151006.png",
        alt: "Morning landscape",
        greeting: "Good morning"
      };
    } else if (hour < 18) {
      return {
        src: "/lovable-uploads/1011af21-48c7-4e0f-acea-e2052fe11364.png",
        alt: "Afternoon scene",
        greeting: "Good afternoon"
      };
    } else {
      return {
        src: "/lovable-uploads/0ade6ca6-8bd6-4751-9b77-1aac333f5e94.png",
        alt: "Evening scene",
        greeting: "Good evening"
      };
    }
  };

  const { src, alt, greeting } = getBannerContent();

  return (
    <div 
      className="relative w-full h-40 sm:h-48 overflow-hidden rounded-xl shadow-sm mb-6"
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
      role="img"
      aria-label={alt}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-sprout-cream/80 to-transparent" />
      
      {currentChild && (
        <h2 className="absolute bottom-4 left-6 text-2xl font-bold text-sprout-purple drop-shadow-sm">
          {greeting}, {currentChild.nickname}!
        </h2>
      )}
    </div>
  );
};

export default HeaderIllustration;
