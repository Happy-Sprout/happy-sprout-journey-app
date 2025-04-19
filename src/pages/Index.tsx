
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useUser } from "@/hooks/useUser";
import { useState, useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!pageReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <Layout hideNav>
      <div className="relative min-h-screen">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://ghucegvhempgmdykosiw.supabase.co/storage/v1/object/public/videos/Animated_Emotion_Loop_Creation_Guide.mp4"
            type="video/mp4"
          />
        </video>
        
        {/* Content Overlay */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-black/30">
          <div className="max-w-3xl w-full flex flex-col items-center text-center">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold mb-4 text-white"
            >
              Welcome to Happy Sprout
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl mb-8 text-white/90"
            >
              Helping children grow their emotional intelligence and social skills.
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {isLoggedIn ? (
                <Button 
                  className="sprout-button text-lg" 
                  onClick={() => navigate("/dashboard")}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    className="sprout-button text-lg" 
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </Button>
                  <Button 
                    className="bg-sprout-purple text-white hover:bg-sprout-purple/90 text-lg rounded-full py-3 px-6" 
                    onClick={() => navigate("/register")}
                  >
                    Register
                  </Button>
                </>
              )}
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl"
          >
            <div className="sprout-card bg-white/90 backdrop-blur">
              <div className="text-3xl mb-4">🌱</div>
              <h3 className="text-xl font-bold mb-2">Emotional Growth</h3>
              <p className="text-gray-600">Help your child understand and manage their emotions with daily check-ins.</p>
            </div>
            
            <div className="sprout-card bg-white/90 backdrop-blur">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-2">Journal Journey</h3>
              <p className="text-gray-600">Track progress through fun journaling activities that encourage reflection.</p>
            </div>
            
            <div className="sprout-card bg-white/90 backdrop-blur">
              <div className="text-3xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-2">Playful Progress</h3>
              <p className="text-gray-600">Earn points, badges, and rewards while developing essential social skills.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
