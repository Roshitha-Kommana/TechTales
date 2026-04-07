// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowLeft,
  FaBook,
  FaClock,
  FaChartLine,
  FaTrophy,
  FaStar,
  FaExclamationTriangle,
} from 'react-icons/fa';
import {
  FaFire,
  FaBullseye,
  FaCalendarDays as FaCalendarAlt,
  FaMedal,
  FaCircleCheck as FaCheckCircle,
  FaCircleXmark as FaTimesCircle,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa6';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { ComprehensiveAnalytics } from '../types';
import { quizzesApi } from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#309898', '#E38EC9', '#68C8FB', '#86F178', '#FFA07A', '#9B59B6'];
const GRADIENT_COLORS = [
  { start: '#309898', end: '#68C8FB' },
  { start: '#E38EC9', end: '#FFA07A' },
  { start: '#86F178', end: '#309898' },
  { start: '#9B59B6', end: '#E38EC9' },
];

// Animated Counter Component
const AnimatedCounter: React.FC<{ value: number; suffix?: string; duration?: number }> = ({
  value,
  suffix = '',
  duration = 1500
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const countRef = useRef<number>(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = countRef.current;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(startValue + (value - startValue) * easeOutQuart);

      setDisplayValue(currentValue);
      countRef.current = currentValue;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}{suffix}</span>;
};

// Progress Ring Component
const ProgressRing: React.FC<{ progress: number; size?: number; strokeWidth?: number; color?: string }> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#309898'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{ strokeDasharray: circumference }}
      />
    </svg>
  );
};

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<ComprehensiveAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'achievements'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await quizzesApi.getComprehensiveAnalytics();
      if (response.success && response.analytics) {
        setAnalytics(response.analytics);
      }
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      const errorMsg = error?.message || error?.error || 'Failed to load analytics. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-papaya flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative w-20 h-20 mx-auto mb-4">
            <motion.div
              className="absolute inset-0 border-4 border-cyan rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ borderTopColor: 'transparent' }}
            />
          </div>
          <p className="text-black opacity-80 font-medium">Loading your analytics...</p>
        </motion.div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-papaya">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
          <motion.div
            className="bg-white rounded-2xl p-12 text-center shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaChartLine className="text-7xl text-gray-300 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-2xl font-bold text-black mb-3">No Analytics Available Yet</h2>
            <p className="text-black mb-8 opacity-70 max-w-md mx-auto">
              Complete some quizzes to unlock powerful insights about your learning journey.
            </p>
            <motion.button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-cyan to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your First Story
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  const { stats, topicPerformance, timeSpentData, genreDistribution, dailyProgress, recentQuizzes, scoreTrend, skillLevel, achievements } = analytics;

  return (
    <div className="min-h-screen bg-papaya">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-black hover:text-cyan transition-colors mb-3 sm:mb-4 min-h-[44px] text-sm sm:text-base"
          >
            <FaArrowLeft />
            <span>Back to Home</span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-black flex items-center gap-3">
              <div className="bg-gradient-to-r from-cyan to-blue-500 p-3 rounded-xl">
                <FaChartLine className="text-white text-xl" />
              </div>
              Learning Analytics
            </h1>

            {/* Tab Navigation */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              {(['overview', 'performance', 'achievements'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-500 hover:text-black'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Hero Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Stories */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-cyan to-blue-500 rounded-2xl p-6 text-white shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <FaBook className="text-3xl opacity-80" />
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">All Time</span>
                  </div>
                  <div className="text-4xl font-bold mb-1">
                    <AnimatedCounter value={stats.totalStoriesRead} />
                  </div>
                  <p className="text-white/80 text-sm">Stories Completed</p>
                </motion.div>

                {/* Average Score */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 text-white shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <FaTrophy className="text-3xl opacity-80" />
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Average</span>
                  </div>
                  <div className="text-4xl font-bold mb-1">
                    <AnimatedCounter value={stats.averageQuizScore} suffix="%" />
                  </div>
                  <p className="text-white/80 text-sm">Quiz Score</p>
                </motion.div>

                {/* Learning Streak */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <FaFire className="text-3xl opacity-80" />
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Streak</span>
                  </div>
                  <div className="text-4xl font-bold mb-1">
                    <AnimatedCounter value={stats.learningStreak || 0} />
                  </div>
                  <p className="text-white/80 text-sm">Day Streak 🔥</p>
                </motion.div>

                {/* Accuracy Rate */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl p-6 text-white shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <FaBullseye className="text-3xl opacity-80" />
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Accuracy</span>
                  </div>
                  <div className="text-4xl font-bold mb-1">
                    <AnimatedCounter value={stats.accuracyRate || 0} suffix="%" />
                  </div>
                  <p className="text-white/80 text-sm">Questions Correct</p>
                </motion.div>
              </div>

              {/* Skill Level & Points */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Skill Level Card */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-6 shadow-lg col-span-1"
                >
                  <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                    <FaMedal className="text-yellow-500" />
                    Skill Level
                  </h3>
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <ProgressRing
                        progress={skillLevel?.progress || 0}
                        size={140}
                        strokeWidth={10}
                        color="#309898"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-black">{skillLevel?.level || 'Beginner'}</span>
                        <span className="text-sm text-gray-500">{Math.round(skillLevel?.progress || 0)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      {(skillLevel?.progress || 0) < 100
                        ? 'Keep learning to level up!'
                        : 'Ready for the next level!'}
                    </p>
                  </div>
                </motion.div>

                {/* Weekly Progress Chart */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-6 shadow-lg col-span-1 lg:col-span-2"
                >
                  <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                    <FaCalendarAlt className="text-cyan" />
                    Weekly Activity
                  </h3>
                  {dailyProgress && dailyProgress.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <ComposedChart data={dailyProgress}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" stroke="#666" fontSize={12} />
                        <YAxis yAxisId="left" stroke="#309898" fontSize={12} />
                        <YAxis yAxisId="right" orientation="right" stroke="#E38EC9" fontSize={12} />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        />
                        <Bar yAxisId="left" dataKey="quizzes" fill="#309898" radius={[4, 4, 0, 0]} name="Quizzes" />
                        <Line yAxisId="right" type="monotone" dataKey="score" stroke="#E38EC9" strokeWidth={3} dot={{ fill: '#E38EC9' }} name="Avg Score" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-500">
                      <p>No activity this week</p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Score Trend & Recent Quizzes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Score Trend */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                    <FaChartLine className="text-cyan" />
                    Score Trend
                  </h3>
                  {scoreTrend && scoreTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={scoreTrend}>
                        <defs>
                          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#309898" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#309898" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="quiz" stroke="#666" fontSize={12} label={{ value: 'Quiz #', position: 'bottom' }} />
                        <YAxis stroke="#666" fontSize={12} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                          formatter={(value: number) => [`${value}%`, 'Score']}
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="#309898"
                          strokeWidth={3}
                          fill="url(#scoreGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-gray-500">
                      <p>Complete more quizzes to see trends</p>
                    </div>
                  )}
                </motion.div>

                {/* Recent Quizzes */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                    <FaClock className="text-cyan" />
                    Recent Quizzes
                  </h3>
                  <div className="space-y-3 max-h-[280px] overflow-y-auto">
                    {recentQuizzes && recentQuizzes.length > 0 ? (
                      recentQuizzes.map((quiz, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center justify-between p-3 rounded-xl ${getScoreBg(quiz.score)}`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-black truncate">{quiz.concept}</p>
                            <p className="text-xs text-gray-500">
                              {quiz.correctAnswers}/{quiz.questionsCount} correct
                            </p>
                          </div>
                          <div className={`text-2xl font-bold ${getScoreColor(quiz.score)}`}>
                            {quiz.score}%
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <p>No quizzes completed yet</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'performance' && (
            <motion.div
              key="performance"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Stats Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <motion.div variants={itemVariants} className="bg-white rounded-xl p-5 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <FaCheckCircle className="text-green-500 text-xl" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-black">{stats.totalCorrectAnswers || 0}</p>
                      <p className="text-sm text-gray-500">Correct Answers</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white rounded-xl p-5 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FaBook className="text-blue-500 text-xl" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-black">{stats.totalQuestionsAnswered || 0}</p>
                      <p className="text-sm text-gray-500">Total Questions</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white rounded-xl p-5 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <FaStar className="text-yellow-500 text-xl" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-black">{stats.totalPoints || 0}</p>
                      <p className="text-sm text-gray-500">Total Points</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white rounded-xl p-5 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <FaClock className="text-purple-500 text-xl" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-black">{stats.totalTimeSpentMinutes}</p>
                      <p className="text-sm text-gray-500">Minutes Spent</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Topic Performance Bar Chart */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-black mb-4">Topic Performance</h3>
                  {topicPerformance.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={topicPerformance}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" domain={[0, 100]} stroke="#666" />
                        <YAxis
                          type="category"
                          dataKey="topic"
                          stroke="#666"
                          width={120}
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                          formatter={(value: number) => [`${value}%`, 'Average Score']}
                        />
                        <Bar dataKey="averageScore" radius={[0, 4, 4, 0]}>
                          {topicPerformance.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.averageScore >= 80 ? '#10b981' : entry.averageScore >= 60 ? '#f59e0b' : '#ef4444'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[350px] flex items-center justify-center text-gray-500">
                      <p>No data yet</p>
                    </div>
                  )}
                </motion.div>

                {/* Genre Distribution Radar */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-black mb-4">Genre Distribution</h3>
                  {genreDistribution.some(g => g.stories > 0) ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={genreDistribution}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="genre" tick={{ fill: '#666', fontSize: 12 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} tick={{ fill: '#666', fontSize: 10 }} />
                        <Radar
                          name="Stories"
                          dataKey="stories"
                          stroke="#9333ea"
                          fill="#9333ea"
                          fillOpacity={0.6}
                        />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[350px] flex items-center justify-center text-gray-500">
                      <p>Complete stories to see distribution</p>
                    </div>
                  )}
                </motion.div>
              </div>



            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements && achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    variants={itemVariants}
                    className={`rounded-2xl p-6 shadow-lg transition-all ${achievement.earned
                      ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300'
                      : 'bg-gray-50 border-2 border-gray-200 opacity-60'
                      }`}
                    whileHover={{ scale: achievement.earned ? 1.02 : 1 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`text-5xl ${!achievement.earned && 'grayscale'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold text-lg ${achievement.earned ? 'text-black' : 'text-gray-500'}`}>
                            {achievement.name}
                          </h3>
                          {achievement.earned && (
                            <FaCheckCircle className="text-green-500" />
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${achievement.earned ? 'text-gray-600' : 'text-gray-400'}`}>
                          {achievement.description}
                        </p>
                        {achievement.earned && (
                          <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            ✓ Unlocked
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {(!achievements || achievements.length === 0) && (
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-12 text-center shadow-lg"
                >
                  <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Achievements Yet</h3>
                  <p className="text-gray-500">Complete quizzes to unlock achievements!</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Analytics;
