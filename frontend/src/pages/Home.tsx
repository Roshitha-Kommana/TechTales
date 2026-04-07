import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaBook,
  FaChartLine,
  FaTrophy,
  FaUser,
  FaPlay,
  FaStar,
  FaBolt,
  FaSignOutAlt,
  FaFileAlt,
  FaBars,
  FaTimes,
  FaTrashAlt
} from 'react-icons/fa';


import ConceptSelector from '../components/ConceptSelector';
import AIAssistant from '../components/AIAssistant';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { storiesApi } from '../services/api';
import { authApi, User } from '../services/auth';
import { quizzesApi } from '../services/api';
import { QuizAnalytics } from '../types';
import { Story } from '../types';
import { useProfileImage } from '../hooks/useProfileImage';
import toast from 'react-hot-toast';

const Home: React.FC = () => {
  const { profileImage } = useProfileImage();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConceptSelector, setShowConceptSelector] = useState(false);
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Open by default on desktop
  const [learningStreak, setLearningStreak] = useState(0);
  const [currentTime, setCurrentTime] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });

  // Check if we're on desktop on mount
  useEffect(() => {
    const handleResize = () => {
      // On desktop (lg and above), keep sidebar state
      // On mobile, close sidebar when resizing to mobile
      if (window.innerWidth < 1024 && sidebarOpen) {
        // Keep mobile behavior
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Close sidebar on mobile when navigation item is clicked
  const handleNavigation = (path: string) => {
    navigate(path);
    // Close sidebar on mobile devices
    if (window.innerWidth < 769) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = authApi.getUser();
      setUser(currentUser);

      // Fetch updated user data including learning streak
      try {
        const updatedUser = await authApi.getCurrentUser();
        if (updatedUser) {
          setUser(updatedUser);
          setLearningStreak(updatedUser.learningStreak || 0);
        } else if (currentUser) {
          setLearningStreak(currentUser.learningStreak || 0);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        if (currentUser) {
          setLearningStreak(currentUser.learningStreak || 0);
        }
      }

      loadDashboardData();
    };

    loadUserData();
  }, []);

  // Real-time IST clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Convert to IST (UTC+5:30)
      const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
      const istTime = new Date(utcTime + istOffset);

      // Get IST time components
      const hours = istTime.getHours() % 12; // 12-hour format
      const minutes = istTime.getMinutes();
      const seconds = istTime.getSeconds();
      setCurrentTime({ hours, minutes, seconds });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsRes, storiesRes] = await Promise.all([
        quizzesApi.getAnalytics(),
        storiesApi.getAll(),
      ]);

      if (analyticsRes.success) {
        setAnalytics(analyticsRes.analytics);
      }
      if (storiesRes.success) {
        setStories(storiesRes.stories || []);
      }
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      const errorMsg = error?.message || error?.error || 'Failed to load dashboard data. Please try again.';
      toast.error(errorMsg);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const handleConceptSelect = async (
    concept: string,
    characterName: string,
    adventureStyle: string,
    difficulty: string,
    file?: File
  ) => {
    setIsLoading(true);
    try {
      const response = await storiesApi.generate({
        concept,
        characterName,
        adventureStyle,
        difficulty,
        numberOfPages: 5,
        file,
      });

      if (response.success && response.story) {
        navigate(`/story/${response.story.id}`);
      }
    } catch (error: any) {
      console.error('Error generating story:', error);
      let errorMsg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to generate story. Please try again.';

      // Check if it's a quota error
      if (errorMsg.includes('quota') || errorMsg.includes('Quota exceeded') || errorMsg.includes('429')) {
        errorMsg = 'Daily API quota exceeded (20 requests/day). The system will automatically try the alternate API key. If both are exhausted, please wait until tomorrow or upgrade your Google AI plan.';
        toast.error(errorMsg, { duration: 8000 });
      } else {
        toast.error(errorMsg);
      }
      console.error('Full error details:', error);
    } finally {
      setIsLoading(false);
      setShowConceptSelector(false);
    }
  };

  const handleDeleteStory = async (storyId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to the story

    if (!window.confirm('Are you sure you want to delete this story?')) {
      return;
    }

    try {
      await storiesApi.delete(storyId);
      // Remove the deleted story from the list
      setStories(prevStories => prevStories.filter(s => s.id !== storyId));
      toast.success('Story deleted successfully');
    } catch (error: any) {
      console.error('Error deleting story:', error);
      toast.error(error?.message || 'Failed to delete story');
    }
  };

  const handleShareStory = async (storyId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to the story

    try {
      const response = await storiesApi.getShareableLink(storyId);
      if (response.shareableLink) {
        await navigator.clipboard.writeText(response.shareableLink);
        toast.success('Share link copied to clipboard!');
      }
    } catch (error: any) {
      console.error('Error sharing story:', error);
      toast.error(error?.message || 'Failed to get share link');
    }
  };

  const handleViewStory = (storyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/story/${storyId}`);
  };

  const storiesCompleted = stories.length;


  const averageScore = analytics?.averageScore || 0;
  const areasOfConcern = analytics?.allAreasOfConcern || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Backdrop Overlay - Only on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Toggle Button - Top Left (Mobile Only) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 w-12 h-12 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center md:hidden"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <FaTimes className="text-gray-700 text-xl" /> : <FaBars className="text-gray-700 text-xl" />}
      </button>

      {/* Floating Toggle Button - Desktop Only (when sidebar is closed) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="hidden md:flex fixed top-4 left-4 z-50 w-12 h-12 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-300 items-center justify-center"
          aria-label="Open sidebar"
        >
          <div className="flex items-center gap-1.5">
            <FaBars className="text-base text-gray-700" />
            <span className="text-xs text-gray-700 rotate-180">←</span>
          </div>
        </button>
      )}

      {/* Sidebar - Left side on desktop, Left side drawer on mobile */}
      <div className={`sidebar fixed top-0 h-screen w-64 max-w-[80vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 z-50 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        left-0 md:shadow-none`}>
        {/* Header with Toggle Button */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <img src="/book.png" alt="Tech Tales" className="w-10 h-10 flex-shrink-0" />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-black">Tech Tales</h1>
              <p className="text-xs text-black opacity-70">Learn through stories</p>
            </div>
          </div>
          {/* Toggle Button - Desktop Only */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 min-w-[44px] min-h-[44px]"
            aria-label="Toggle sidebar"
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <div className="flex items-center gap-1.5">
              <FaBars className="text-base" />
              <span className={`text-xs transition-transform duration-300 ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`}>←</span>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col custom-scrollbar">
          <div className="mb-4 flex-shrink-0">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">NAVIGATION</h2>
            <nav className="space-y-1.5">
              <button
                onClick={() => handleNavigation('/')}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-brick text-white hover:bg-brick-500 transition-all duration-200 min-h-[44px]"
              >
                <FaHome className="text-lg" />
                <span className="font-medium">Learning Hub</span>
              </button>
              <button
                onClick={() => handleNavigation('/library')}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-black hover:bg-brick hover:text-white transition-all duration-200 min-h-[44px]"
              >
                <FaBook className="text-lg" />
                <span className="font-medium">My Stories</span>
              </button>
              <button
                onClick={() => handleNavigation('/analytics')}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-black hover:bg-brick hover:text-white transition-all duration-200 min-h-[44px]"
              >
                <FaChartLine className="text-lg" />
                <span className="font-medium">Analytics</span>
              </button>
              <button
                onClick={() => handleNavigation('/notes')}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-black hover:bg-brick hover:text-white transition-all duration-200 min-h-[44px]"
              >
                <FaFileAlt className="text-lg" />
                <span className="font-medium">Notes</span>
              </button>
              <button
                onClick={() => handleNavigation('/leaderboard')}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-black hover:bg-brick hover:text-white transition-all duration-200 min-h-[44px]"
              >
                <FaTrophy className="text-lg" />
                <span className="font-medium">Leaderboard</span>
              </button>
              <button
                onClick={() => handleNavigation('/profile')}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-black hover:bg-brick hover:text-white transition-all duration-200 min-h-[44px]"
              >
                <FaUser className="text-lg" />
                <span className="font-medium">Profile</span>
              </button>
            </nav>

            {/* Theme Switcher - Color Profiles */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <ThemeSwitcher />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mb-4 flex-shrink-0">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">QUICK STATS</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2.5">
                  <FaTrophy className="text-yellow-500 text-base" />
                  <span className="text-sm text-gray-700">Stories Completed</span>
                </div>
                <span className="font-bold text-gray-900">{storiesCompleted}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2.5">
                  <FaBook className="text-cyan text-base" />
                  <span className="text-sm text-gray-700">Learning Streak</span>
                </div>
                <span className="font-bold text-gray-900">{learningStreak} days</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 p-2.5 bg-papaya rounded-lg mb-2.5 border border-gray-200">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover shadow-sm flex-shrink-0 border-2 border-white"
              />
            ) : (
              <div className="w-9 h-9 bg-cyan rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-black truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-black opacity-70 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brick text-white hover:bg-brick-500 rounded-lg transition-all duration-200 font-medium text-sm min-h-[44px]"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-64 md:w-[calc(100%-16rem)]' : 'ml-0 w-full'}`}>
        <div className="p-4 pt-20 md:pt-6 md:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen bg-papaya">
          {/* Welcome Banner */}
          <div className="bg-amber rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 mb-6 md:mb-8 shadow-lg animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FaStar className="text-black text-lg md:text-xl animate-pulse" />
                  <span className="text-black font-semibold text-sm md:text-base">Welcome back!</span>
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-black mb-2">
                  Ready for your next adventure, {user?.name || 'Learner'}?
                </h2>
                <p className="text-black text-sm md:text-base mb-4 md:mb-6 opacity-90">
                  Discover new worlds while mastering complex topics through personalized storytelling.
                </p>
                <button
                  onClick={() => setShowConceptSelector(true)}
                  className="bg-cyan text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-cyan-500 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 text-sm md:text-base min-h-[44px]"
                >
                  <FaPlay />
                  Start New Story
                </button>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Stories Completed */}
            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 animate-slide-up">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-black font-medium text-sm md:text-base">Stories Completed</h3>
                <FaBook className="text-cyan text-xl md:text-2xl" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-black mb-2">{storiesCompleted}</div>
              <p className="text-black text-xs md:text-sm font-medium opacity-70">+{storiesCompleted} this week</p>
            </div>

            {/* Average Score */}
            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-black font-medium text-sm md:text-base">Average Score</h3>
                <FaStar className="text-amber text-xl md:text-2xl" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-black mb-2">{averageScore}%</div>
              <div className="flex items-center gap-1">
                <span className="text-black text-xs md:text-sm font-medium">Excellent progress!</span>
                <FaStar className="text-amber text-xs" />
              </div>
            </div>

            {/* Learning Streak */}
            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-black font-medium text-sm md:text-base">Learning Streak</h3>
                {/* Analog Clock */}
                <div className="relative" style={{ width: '40px', height: '40px' }}>
                  <svg width="40" height="40" viewBox="0 0 48 48" className="absolute inset-0">
                    {/* Clock face circle */}
                    <circle cx="24" cy="24" r="22" fill="white" stroke="#f97316" strokeWidth="2" />
                    {/* Hour markers */}
                    {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour, index) => {
                      const angle = (index * 30 - 90) * (Math.PI / 180);
                      const x1 = 24 + 18 * Math.cos(angle);
                      const y1 = 24 + 18 * Math.sin(angle);
                      const x2 = 24 + 20 * Math.cos(angle);
                      const y2 = 24 + 20 * Math.sin(angle);
                      return (
                        <line
                          key={hour}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#f97316"
                          strokeWidth="1.5"
                        />
                      );
                    })}
                    {/* Hour hand */}
                    <line
                      x1="24"
                      y1="24"
                      x2={24 + 10 * Math.cos(((currentTime.hours * 30 + currentTime.minutes * 0.5) - 90) * (Math.PI / 180))}
                      y2={24 + 10 * Math.sin(((currentTime.hours * 30 + currentTime.minutes * 0.5) - 90) * (Math.PI / 180))}
                      stroke="#f97316"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {/* Minute hand */}
                    <line
                      x1="24"
                      y1="24"
                      x2={24 + 14 * Math.cos(((currentTime.minutes * 6) - 90) * (Math.PI / 180))}
                      y2={24 + 14 * Math.sin(((currentTime.minutes * 6) - 90) * (Math.PI / 180))}
                      stroke="#f97316"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    {/* Second hand */}
                    <line
                      x1="24"
                      y1="24"
                      x2={24 + 16 * Math.cos(((currentTime.seconds * 6) - 90) * (Math.PI / 180))}
                      y2={24 + 16 * Math.sin(((currentTime.seconds * 6) - 90) * (Math.PI / 180))}
                      stroke="#ea580c"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                    {/* Center dot */}
                    <circle cx="24" cy="24" r="2" fill="#f97316" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-black mb-2">{learningStreak} days</div>
              <div className="flex items-center gap-1">
                <span className="text-black text-xs md:text-sm font-medium">Keep it up!</span>
                <FaBolt className="text-amber text-xs" />
              </div>
            </div>
          </div>




          {/* Recent Stories */}
          <div className="mb-6 md:mb-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <FaBook className="text-cyan text-lg md:text-xl" />
              <h3 className="text-lg md:text-xl font-semibold text-black">Recent Stories</h3>
            </div>
            {stories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {stories.slice(0, 6).map((story, index) => {
                  if (!story.id) {
                    console.warn('Story missing ID:', story);
                    return null;
                  }
                  return (
                    <div
                      key={story.id || `story-${index}`}
                      className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px] relative group"
                    >
                      {/* Action buttons - appear on hover */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        {/* View button */}
                        <button
                          onClick={(e) => story.id && handleViewStory(story.id, e)}
                          className="w-8 h-8 bg-cyan hover:bg-cyan-600 text-white rounded-full flex items-center justify-center shadow-md"
                          title="Read story"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </button>
                        {/* Share button */}
                        <button
                          onClick={(e) => story.id && handleShareStory(story.id, e)}
                          className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-md"
                          title="Share story"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={(e) => story.id && handleDeleteStory(story.id, e)}
                          className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md"
                          title="Delete story"
                        >
                          <FaTrashAlt className="text-xs" />
                        </button>
                      </div>
                      {/* Clickable area for story */}
                      <div
                        className="cursor-pointer"
                        onClick={() => story.id && navigate(`/story/${story.id}`)}
                      >
                        {story.pages[0]?.imageUrl && (
                          <img
                            src={story.pages[0].imageUrl}
                            alt={story.title}
                            className="w-full h-24 md:h-32 object-cover rounded-lg mb-2 md:mb-3"
                            loading="lazy"
                          />
                        )}
                        <h4 className="font-semibold text-black mb-1 text-sm md:text-base">{story.title}</h4>
                        <p className="text-xs md:text-sm text-black opacity-70">{story.concept}</p>
                      </div>
                    </div>
                  );


                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center">
                <FaBook className="text-gray-300 text-4xl mx-auto mb-4" />
                <p className="text-black opacity-80">No stories yet. Create your first story to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Concept Selector Modal */}
      {showConceptSelector && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4 overflow-y-auto"
          style={{
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowConceptSelector(false);
            }
          }}
        >
          <div className="relative max-w-3xl w-full my-8">
            <ConceptSelector
              onSelect={handleConceptSelect}
              isLoading={isLoading}
              onClose={() => setShowConceptSelector(false)}
            />
          </div>
        </div>
      )}

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
};

export default Home;
