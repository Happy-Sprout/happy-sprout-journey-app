
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useUser } from "@/hooks/useUser";

const Index = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();

  return (
    <Layout hideNav>
      {/* Video background - hidden on mobile */}
      <div className="hidden md:block fixed inset-0 z-0 overflow-hidden">
        <video
          className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2"
          autoPlay
          loop
          muted
          playsInline
        >
          <source
            src="https://ghucegvhempgmdykosiw.supabase.co/storage/v1/object/public/videos/Animated_Emotion_Loop_Creation_Guide.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Mobile background */}
      <div className="block md:hidden fixed inset-0 z-0 bg-sprout-cream" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 md:px-8 pt-safe pb-8">
        <div className="max-w-3xl w-full flex flex-col items-center text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl md:text-5xl font-bold mb-4 text-sprout-purple md:text-white md:drop-shadow-lg"
          >
            Welcome to Happy Sprout
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-lg md:text-xl mb-8 text-gray-700 md:text-white/90 md:drop-shadow-md"
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
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full"
        >
          <div className="sprout-card max-w-xs w-full mx-auto md:max-w-none bg-white/95 md:bg-white/80 backdrop-blur-sm">
            <div className="text-3xl mb-4">🌱</div>
            <h3 className="text-xl font-bold mb-2">Emotional Growth</h3>
            <p className="text-gray-700">Help your child understand and manage their emotions with daily check-ins.</p>
          </div>
          
          <div className="sprout-card max-w-xs w-full mx-auto md:max-w-none bg-white/95 md:bg-white/80 backdrop-blur-sm">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">Journal Journey</h3>
            <p className="text-gray-700">Track progress through fun journaling activities that encourage reflection.</p>
          </div>
          
          <div className="sprout-card max-w-xs w-full mx-auto md:max-w-none bg-white/95 md:bg-white/80 backdrop-blur-sm">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2">Playful Progress</h3>
            <p className="text-gray-700">Earn points, badges, and rewards while developing essential social skills.</p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Index;
