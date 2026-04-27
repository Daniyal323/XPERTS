import React from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Briefcase } from "lucide-react";

export function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-gradient-to-br from-[#0F3B5F] to-[#1E293B] flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl mb-8">
          <Briefcase className="w-20 h-20 text-white" strokeWidth={1.5} />
        </div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl tracking-tight text-white mb-3"
          style={{ fontWeight: 600 }}
        >
          XPERTS
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-white/80 text-center max-w-sm"
          style={{ fontWeight: 400 }}
        >
          Verbinden Sie Ihr Unternehmen mit erstklassigen Industrieexperten
        </motion.p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        onClick={() => navigate("/role-select")}
        className="mt-16 bg-white text-[#0F3B5F] px-12 py-4 rounded-full hover:bg-white/90 transition-all shadow-xl"
        style={{ fontWeight: 500 }}
      >
        Los geht's
      </motion.button>
    </div>
  );
}
