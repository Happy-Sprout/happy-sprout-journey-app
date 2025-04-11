
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserRound, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const NoActiveChildPrompt = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <Card className="border-2 border-sprout-orange/50 bg-sprout-orange/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-shrink-0 bg-sprout-orange/20 p-4 rounded-full">
              <UserRound size={40} className="text-sprout-orange" />
            </div>
            
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">📣 No Active Profile Selected!</h3>
              <p className="text-gray-600 mb-4">
                To begin your daily activities, please activate a child profile.
              </p>
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex-shrink-0"
            >
              <Button
                onClick={() => navigate("/profile")}
                className="bg-sprout-orange text-white hover:bg-sprout-orange/90 gap-2 text-base px-6 py-2 h-auto"
              >
                Select Child Profile
                <ArrowRight size={16} />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NoActiveChildPrompt;
