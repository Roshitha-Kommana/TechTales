// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTrophy, FaArrowLeft, FaClock } from 'react-icons/fa';
import { FaFire } from 'react-icons/fa6';
import { leaderboardApi } from '../services/api';
import { LeaderboardData, LeaderboardUser } from '../types';
import { useProfileImage } from '../hooks/useProfileImage';
import toast from 'react-hot-toast';

const Leaderboard: React.FC = () => {
  const { profileImage } = useProfileImage();
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await leaderboardApi.getLeaderboard();
      if (response.success) {
        setLeaderboardData({
          leaderboard: response.leaderboard || [],
          weekInfo: response.weekInfo || { displayRange: 'This Week', startDate: '', endDate: '' },
          currentUser: response.currentUser || null,
        });
      }
    } catch (error: any) {
      console.error('Error loading leaderboard:', error);
      const errorMsg = error?.message || error?.error || 'Failed to load leaderboard. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankBackground = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-white border-2 border-brick';
    }
    if (rank === 1) {
      return 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-400';
    } else if (rank === 2) {
      return 'bg-gradient-to-r from-gray-100 to-slate-200 border-gray-400';
    } else if (rank === 3) {
      return 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-400';
    }
    return 'bg-white border-gray-200';
  };

  const getRankTextColor = (rank: number) => {
    if (rank === 1) {
      return 'text-yellow-700';
    } else if (rank === 2) {
      return 'text-gray-700';
    } else if (rank === 3) {
      return 'text-orange-700';
    }
    return 'text-gray-600';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return '🥇';
    } else if (rank === 2) {
      return '🥈';
    } else if (rank === 3) {
      return '🥉';
    }
    return null;
  };

  const getAvatarGradient = (name: string) => {
    const colors = [
      'from-purple-400 to-purple-600',
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-red-400 to-red-600',
      'from-teal-400 to-teal-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'text-orange-500';
    if (streak >= 3) return 'text-yellow-500';
    return 'text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (!leaderboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load leaderboard.</p>
          <button
            onClick={() => navigate('/')}
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { leaderboard, weekInfo, currentUser } = leaderboardData;

  return (
    <div className="min-h-screen bg-papaya">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-black hover:text-cyan transition-colors mb-3 sm:mb-4 min-h-[44px] text-sm sm:text-base"
          >
            <FaArrowLeft />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 sm:p-4">
                <FaTrophy className="text-white text-2xl sm:text-3xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-black">Weekly Leaderboard</h1>
                <p className="text-black text-sm sm:text-base opacity-80">Top learners compete every week!</p>
              </div>
            </div>

            {/* Week Info Badge */}
            <div className="bg-gradient-to-r from-cyan to-blue-500 text-white px-4 py-2 rounded-lg shadow-md">
              <div className="flex items-center gap-2">
                <FaClock className="text-lg" />
                <div>
                  <div className="text-xs opacity-80">Current Week</div>
                  <div className="font-semibold text-sm">{weekInfo?.displayRange || 'This Week'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Points Reset Notice */}
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm text-center">
              ⏰ Weekly points reset every Monday at midnight. Keep learning to climb the ranks!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {/* Legend */}
        <div className="bg-white rounded-xl p-4 shadow-md mb-6">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <FaTrophy className="text-yellow-500" />
              <span className="text-gray-600">Weekly Points</span>
            </div>
            <div className="flex items-center gap-2">
              <FaFire className="text-orange-500" />
              <span className="text-gray-600">Learning Streak (days)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">📊</span>
              <span className="text-gray-600">Total Points</span>
            </div>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">No learners yet</h2>
            <p className="text-gray-400 mb-6">Be the first to appear on the leaderboard!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-cyan text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-500 transition-colors"
            >
              Start Learning
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {leaderboard.map((user: LeaderboardUser, index: number) => {
              const isCurrentUser = currentUser && user.email === currentUser.email;
              const rankBadge = getRankBadge(user.rank);
              const avatarGradient = getAvatarGradient(user.name);

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className={`rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all border-2 ${getRankBackground(user.rank, !!isCurrentUser)}`}
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    {/* Rank */}
                    <div className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl ${getRankTextColor(user.rank)}`}>
                      {rankBadge ? (
                        <span className="text-2xl sm:text-3xl">{rankBadge}</span>
                      ) : (
                        <span>#{user.rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    {isCurrentUser && profileImage ? (
                      <img
                        src={profileImage}
                        alt={user.name}
                        className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover shadow-md border-2 border-white"
                      />
                    ) : (
                      <div className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Name and Email */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-black text-base sm:text-lg truncate">
                          {user.name}
                        </h3>
                        {isCurrentUser && (
                          <span className="px-2 py-1 bg-brick text-white rounded-full text-xs font-semibold">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-black text-sm truncate opacity-70">{user.email}</p>

                      {/* Streak Badge */}
                      {user.learningStreak > 0 && (
                        <div className={`flex items-center gap-1 mt-1 ${getStreakColor(user.learningStreak)}`}>
                          <FaFire className="text-sm" />
                          <span className="text-xs font-medium">
                            {user.learningStreak} day streak
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Points Section */}
                    <div className="flex-shrink-0 text-right">
                      {/* Weekly Points - Main */}
                      <div className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan to-blue-600">
                        {user.weeklyPoints.toLocaleString()}
                      </div>
                      <div className="text-xs sm:text-sm text-cyan font-medium">weekly pts</div>

                      {/* Total Points - Secondary */}
                      <div className="text-xs text-gray-400 mt-1">
                        Total: {user.points.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Current User Not in Top 50 Message */}
        {currentUser && !leaderboard.some(u => u.email === currentUser.email) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: leaderboard.length * 0.05 }}
            className="mt-6 bg-white border-2 border-brick rounded-xl p-6 shadow-md"
          >
            <div className="flex items-center gap-4">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={currentUser.name}
                  className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover shadow-md border-2 border-white"
                />
              ) : (
                <div className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${getAvatarGradient(currentUser.name)} flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md`}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-black text-base sm:text-lg">
                    {currentUser.name}
                  </h3>
                  <span className="px-2 py-1 bg-brick text-white rounded-full text-xs font-semibold">
                    You
                  </span>
                  {currentUser.rank && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                      Rank #{currentUser.rank}
                    </span>
                  )}
                </div>
                <p className="text-black text-sm opacity-70">{currentUser.email}</p>
                {currentUser.learningStreak > 0 && (
                  <div className={`flex items-center gap-1 mt-1 ${getStreakColor(currentUser.learningStreak)}`}>
                    <FaFire className="text-sm" />
                    <span className="text-xs font-medium">
                      {currentUser.learningStreak} day streak
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan to-blue-600">
                  {currentUser.weeklyPoints.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-cyan font-medium">weekly pts</div>
                <div className="text-xs text-gray-400 mt-1">
                  Total: {currentUser.points.toLocaleString()}
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-black text-sm opacity-80">
              Keep learning to climb the leaderboard! 🚀
            </p>
          </motion.div>
        )}

        {/* How Points Work */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-black mb-4 text-center">📚 How to Earn Points</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-semibold text-green-700">Complete Quiz</div>
              <div className="text-sm text-green-600">+10 base points</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold text-blue-700">Score Bonus</div>
              <div className="text-sm text-blue-600">Up to +20 points</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl mb-2">🔥</div>
              <div className="font-semibold text-orange-700">Daily Streak</div>
              <div className="text-sm text-orange-600">Learn every day!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
