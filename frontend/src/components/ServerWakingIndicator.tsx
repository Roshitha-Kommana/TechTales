import React from 'react';
import { useServerWaking } from '../context/ServerWakingContext';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Component that displays a loading message when the backend is waking up
 * Should be placed near the top of your app (after providers)
 */
export const ServerWakingIndicator: React.FC = () => {
  const { isWakingUp } = useServerWaking();

  return (
    <AnimatePresence>
      {isWakingUp && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 z-50 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            {/* Spinner */}
            <div className="animate-spin">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            
            {/* Message */}
            <div className="flex-1">
              <p className="font-semibold text-sm">
                ☁️ Waking up server...
              </p>
              <p className="text-xs opacity-90">
                Please wait while we start the backend service (this happens on first request)
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServerWakingIndicator;
