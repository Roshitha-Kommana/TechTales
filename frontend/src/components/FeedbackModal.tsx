import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaStar, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { feedbackApi } from '../services/api';
import toast from 'react-hot-toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  topic: string;
  totalQuestions: number;
}

interface FeedbackData {
  encouragementMessage: string;
  nextTopics: string[];
  areasOfConcern: string[];
  pointsEarned?: number;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  score,
  topic,
  totalQuestions,
}) => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && !feedback) {
      loadFeedback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, feedback]);

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      // Validate topic before making request
      const validTopic = topic && topic.trim() !== '' && topic !== 'undefined'
        ? topic.trim()
        : 'this topic';

      console.log('📝 Loading feedback:', { score, topic: validTopic, totalQuestions });

      const response = await feedbackApi.generate(score, validTopic, totalQuestions);
      if (response.success && response.feedback) {
        setFeedback(response.feedback);
      } else {
        throw new Error('Invalid response from feedback API');
      }
    } catch (error: any) {
      console.error('Error loading feedback:', error);
      console.error('Error details:', error?.response?.data);

      toast.error('Failed to load personalized feedback. Showing default feedback.');

      // Set fallback feedback with validated topic
      const validTopic = topic && topic.trim() !== '' && topic !== 'undefined'
        ? topic.trim()
        : 'this topic';

      setFeedback({
        encouragementMessage: score >= 80
          ? `Great job on your quiz! You scored ${score}% on ${validTopic}. Keep up the excellent work!`
          : `You scored ${score}% on ${validTopic}. Keep practicing and you'll improve!`,
        nextTopics: [
          `Advanced concepts in ${validTopic}`,
          `Related applications of ${validTopic}`,
          `Real-world examples of ${validTopic}`,
        ],
        areasOfConcern: score < 80 ? [`Review ${validTopic} fundamentals`] : [],
        pointsEarned: score * 10,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreCategory = () => {
    if (score >= 90) {
      return {
        icon: FaTrophy,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        message: 'Excellent Work!',
      };
    } else if (score >= 70) {
      return {
        icon: FaStar,
        color: 'text-cyan',
        bgColor: 'bg-papaya',
        message: 'Great Job!',
      };
    } else if (score >= 50) {
      return {
        icon: FaStar,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        message: 'Good Effort!',
      };
    } else {
      return {
        icon: FaExclamationTriangle,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        message: 'Keep Learning!',
      };
    }
  };

  const handleShare = async () => {
    if (!feedback) return;

    const shareText = `I just scored ${score}% on a quiz about ${topic}! ${feedback.encouragementMessage} #TechTalesLearning`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success('Progress copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const scoreCategory = getScoreCategory();
  const IconComponent = scoreCategory.icon;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-20"
          >
            <FaTimes className="text-2xl" />
          </button>

          <div className="p-6 sm:p-8">
            {/* Score Category Display */}
            <div className={`${scoreCategory.bgColor} rounded-xl p-6 mb-6 text-center`}>
              <IconComponent className={`${scoreCategory.color} text-5xl sm:text-6xl mx-auto mb-4`} />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                {scoreCategory.message}
              </h2>
              <div className="text-4xl sm:text-5xl font-bold text-gray-900">
                {score}%
              </div>
              {feedback?.pointsEarned && (
                <div className="mt-3 text-sm text-gray-600">
                  +{feedback.pointsEarned} points earned!
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan mx-auto mb-4"></div>
                <p className="text-gray-600">Generating personalized feedback...</p>
              </div>
            ) : feedback ? (
              <>
                {/* Personal Encouragement Message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-papaya rounded-xl p-6 mb-6 border-l-4 border-cyan"
                >
                  <p className="text-black text-base sm:text-lg leading-relaxed">
                    {feedback.encouragementMessage}
                  </p>
                </motion.div>

                {/* What to Explore Next */}
                {feedback.nextTopics && feedback.nextTopics.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-blue-50 rounded-xl p-6 mb-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-yellow-500 text-xl">💡</span>
                      <h3 className="text-lg font-semibold text-gray-800">What to Explore Next</h3>
                    </div>
                    <ol className="list-decimal list-inside space-y-2 text-black">
                      {feedback.nextTopics.map((topic, index) => (
                        <li key={index} className="text-sm sm:text-base">{topic}</li>
                      ))}
                    </ol>
                  </motion.div>
                )}

                {/* Areas of Concern */}
                {score < 80 && feedback.areasOfConcern && feedback.areasOfConcern.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-orange-50 rounded-xl p-6 mb-6 border-l-4 border-orange-500"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FaExclamationTriangle className="text-orange-500 text-xl" />
                      <h3 className="text-lg font-semibold text-gray-800">Areas to Review</h3>
                    </div>
                    <ul className="space-y-2">
                      {feedback.areasOfConcern.map((area, index) => (
                        <li key={index} className="text-black flex items-start text-sm sm:text-base">
                          <span className="text-amber mr-2">•</span>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Keep Going Message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mb-6"
                >
                  <p className="text-black text-base sm:text-lg mb-4">
                    Ready for your next adventure? Let's keep the momentum going!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/');
                      }}
                      className="px-6 py-3 bg-cyan text-white rounded-lg font-semibold hover:bg-cyan-500 transition-all shadow-lg hover:shadow-xl min-h-[44px]"
                    >
                      Continue Learning
                    </button>
                    <button
                      onClick={handleShare}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      {copied ? (
                        <>
                          <span className="text-green-500">✓</span>
                          Copied!
                        </>
                      ) : (
                        <>
                          <FaTrophy />
                          Share Progress
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FeedbackModal;
