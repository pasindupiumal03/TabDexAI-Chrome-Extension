import React from "react";
import { motion } from "framer-motion";

function WelcomePage({ onConnect }) {
  return (
    <motion.div
      className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 text-white flex flex-col items-center justify-center p-8 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Solid color overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: '#111728' }}></div>

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 text-center">
        {/* TabDexAI Logo */}
        <motion.div
          className="flex items-center justify-center"
          initial={{ scale: 0.95, y: 6, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <img
            src="./assets/icons/tabdexai_logo-removebg.png"
            alt="TabDexAI Logo"
            className="w-28 h-28 object-contain"
          />
        </motion.div>

        {/* Welcome Text */}
        <motion.div className="space-y-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.25 }}>
          <h1
            className="text-white"
            style={{
              fontFamily: 'Poppins Regular',
              fontWeight: '800',
              fontSize: '40px',
              lineHeight: '42px',
              letterSpacing: '0.04em'
            }}
          >
            WELCOME TO
          </h1>
          <h2
            className="text-white"
            style={{
              fontFamily: 'Poppins SemiBold',
              fontWeight: '800',
              fontSize: '44px',
              lineHeight: '46px',
              letterSpacing: '0.04em'
            }}
          >
            TabDexAI
          </h2>
        </motion.div>

        {/* Subtitle */}
        <motion.p className="text-sm opacity-80 max-w-xs leading-relaxed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.25 }}>
          Please connect your wallet to access TabDexAI features
        </motion.p>

        {/* Connect Button (flat) */}
        <motion.button
          onClick={onConnect}
          className="text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3"
          style={{ backgroundColor: '#6E4EFF', border: 'none' }}
          onMouseEnter={(e) => { e.target.style.backgroundColor = '#5A3FE6'; }}
          onMouseLeave={(e) => { e.target.style.backgroundColor = '#6E4EFF'; }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Log In with Phantom</span>
          <img
            src="./assets/icons/panthom-wallet.png"
            alt="Phantom Wallet"
            className="w-6 h-6 object-contain"
          />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default WelcomePage;
