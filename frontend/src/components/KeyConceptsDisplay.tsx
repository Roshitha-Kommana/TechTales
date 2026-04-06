import React from 'react';
import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

interface KeyConceptsDisplayProps {
  keyConcepts: string[];
}

const KeyConceptsDisplay: React.FC<KeyConceptsDisplayProps> = ({ keyConcepts }) => {
  if (!keyConcepts || keyConcepts.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto mb-6 bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <FaStar className="text-yellow-500 text-xl" />
        <h3 className="text-xl font-bold text-gray-800">Key Concepts You Learned</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        {keyConcepts.map((concept, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
              type: "spring",
              stiffness: 200
            }}
            className="px-4 py-2 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
          >
            {concept}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default KeyConceptsDisplay;
