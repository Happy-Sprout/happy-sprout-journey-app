
import { useUser } from "@/hooks/useUser";
import { motion } from "framer-motion";
import { Sparkles, Sun, Moon, Sunset } from "lucide-react";

const HeaderIllustration = () => {
  const { getCurrentChild } = useUser();
  const currentChild = getCurrentChild();
  const hour = new Date().getHours();
  
  const getBannerContent = () => {
    if (hour < 12) {
      return {
        src: "/lovable-uploads/d922725d-2ebb-46aa-aed6-f28d6d151006.png",
        alt: "Morning landscape",
        greeting: "Good morning",
        icon: Sun,
        color: "text-yellow-400",
        bgGradient: "from-orange-200/20 via-yellow-200/20 to-transparent"
      };
    } else if (hour < 18) {
      return {
        src: "/lovable-uploads/1011af21-48c7-4e0f-acea-e2052fe11364.png",
        alt: "Afternoon scene",
        greeting: "Good afternoon",
        icon: Sunset,
        color: "text-orange-400",
        bgGradient: "from-blue-200/20 via-indigo-200/20 to-transparent"
      };
    } else {
      return {
        src: "/lovable-uploads/0ade6ca6-8bd6-4751-9b77-1aac333f5e94.png",
        alt: "Evening scene",
        greeting: "Good evening",
        icon: Moon,
        color: "text-purple-400",
        bgGradient: "from-purple-200/20 via-pink-200/20 to-transparent"
      };
    }
  };

  const { src, alt, greeting, icon: Icon, color, bgGradient } = getBannerContent();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-44 sm:h-52 overflow-hidden rounded-2xl shadow-lg mb-6 group"
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
      role="img"
      aria-label={alt}
    >
      {/* Enhanced gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} group-hover:opacity-90 transition-opacity duration-300`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      
      {/* Floating sparkles animation */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-4 right-6"
      >
        <Sparkles className="h-6 w-6 text-white/60" />
      </motion.div>
      
      {/* Time-based icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="absolute top-4 left-6"
      >
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </motion.div>
      
      {/* Enhanced greeting text */}
      {currentChild && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="absolute bottom-6 left-6 right-6"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg mb-1">
            {greeting}, {currentChild.nickname}!
          </h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-white/90 text-sm font-medium"
          >
            Ready to grow and learn today? 🌱
          </motion.p>
        </motion.div>
      )}
      
      {/* Subtle hover effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-sprout-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

export default HeaderIllustration;
