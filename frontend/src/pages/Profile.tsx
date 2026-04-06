// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaArrowLeft,
    FaUser,
    FaPenToSquare,
    FaFloppyDisk,
    FaXmark,
    FaFire,
    FaStar,
    FaBook,
    FaTrophy,
    FaGear,
    FaLock,
    FaBell,
    FaCheck,
    FaCalendarDays,
    FaChartLine,
    FaCamera,
} from 'react-icons/fa6';
import { authApi, User, ProfileUpdateData } from '../services/auth';
import { quizzesApi } from '../services/api';
import { useProfileImage } from '../hooks/useProfileImage';
import toast from 'react-hot-toast';

// Avatar color options
const AVATAR_COLORS = [
    '#309898', // Cyan (default)
    '#E38EC9', // Pink
    '#6366F1', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Fuchsia
    '#14B8A6', // Teal
    '#F97316', // Orange
];

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [stats, setStats] = useState({
        totalStories: 0,
        averageScore: 0,
        totalQuizzes: 0,
    });

    // Edit form state
    const [editForm, setEditForm] = useState({
        name: '',
        avatarColor: '#309898',
        bio: '',
        preferredDifficulty: 'medium',
        notificationsEnabled: true,
    });

    // Password change state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Profile image state
    const { profileImage, updateProfileImage } = useProfileImage();
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);

    useEffect(() => {
        loadUserData();
        loadStats();
    }, []);

    const loadUserData = async () => {
        setIsLoading(true);
        try {
            const userData = await authApi.getCurrentUser();
            if (userData) {
                setUser(userData);
                setEditForm({
                    name: userData.name || '',
                    avatarColor: userData.avatarColor || '#309898',
                    bio: userData.bio || '',
                    preferredDifficulty: userData.preferredDifficulty || 'medium',
                    notificationsEnabled: userData.notificationsEnabled !== false,
                });
            }
        } catch (error) {
            console.error('Error loading user:', error);
            toast.error('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await quizzesApi.getComprehensiveAnalytics();
            if (response.success && response.analytics) {
                setStats({
                    totalStories: response.analytics.stats.totalStoriesRead || 0,
                    averageScore: response.analytics.stats.averageQuizScore || 0,
                    totalQuizzes: response.analytics.stats.totalStoriesRead || 0,
                });
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleSaveProfile = async () => {
        if (!editForm.name.trim()) {
            toast.error('Name cannot be empty');
            return;
        }

        setIsSaving(true);
        try {
            const response = await authApi.updateProfile(editForm);
            if (response.success) {
                setUser(response.user);
                setIsEditing(false);
                toast.success('Profile updated successfully!');
            }
        } catch (error: any) {
            toast.error(error?.error || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsChangingPassword(true);
        try {
            const response = await authApi.changePassword(
                passwordForm.currentPassword,
                passwordForm.newPassword
            );
            if (response.success) {
                toast.success('Password changed successfully!');
                setShowPasswordModal(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error: any) {
            toast.error(error?.error || 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            toast.error('Only JPG, JPEG, and PNG files are allowed');
            return;
        }

        setIsUploadingImage(true);

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            updateProfileImage(base64String);
            setIsUploadingImage(false);
            toast.success('Profile photo updated!');
        };
        reader.onerror = () => {
            toast.error('Failed to read file');
            setIsUploadingImage(false);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        updateProfileImage(null);
        toast.success('Profile photo removed');
    };

    const getMemberSince = () => {
        if (!user?.createdAt) return 'Unknown';
        const date = new Date(user.createdAt);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-papaya flex items-center justify-center">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <motion.div
                            className="absolute inset-0 border-4 border-cyan rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{ borderTopColor: 'transparent' }}
                        />
                    </div>
                    <p className="text-black opacity-80">Loading profile...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-papaya">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-black hover:text-cyan transition-colors mb-3 min-h-[44px]"
                    >
                        <FaArrowLeft />
                        <span>Back to Home</span>
                    </button>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl sm:text-3xl font-bold text-black flex items-center gap-3">
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-xl">
                                <FaUser className="text-white text-xl" />
                            </div>
                            My Profile
                        </h1>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 bg-cyan text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
                            >
                                <FaPenToSquare />
                                <span className="hidden sm:inline">Edit Profile</span>
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    <FaXmark />
                                    <span className="hidden sm:inline">Cancel</span>
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                >
                                    <FaFloppyDisk />
                                    <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Profile Card */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-2xl shadow-lg p-6 mb-6"
                    >
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative">
                                    {profileImage ? (
                                        <div className="relative w-28 h-28 rounded-full shadow-lg transition-all overflow-hidden border-4 border-white">
                                            <img
                                                src={profileImage}
                                                alt="Profile"
                                                onClick={() => !isEditing && setShowImageModal(true)}
                                                className={`w-full h-full object-cover transition-all ${isUploadingImage ? 'opacity-50' : 'opacity-100'} ${!isEditing ? 'cursor-pointer hover:scale-105' : ''}`}
                                            />
                                            {isUploadingImage && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => !isEditing && setShowImageModal(true)}
                                            className={`w-28 h-28 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg transition-all border-4 border-transparent ${!isEditing ? 'cursor-pointer hover:scale-105' : ''}`}
                                            style={{ backgroundColor: isEditing ? editForm.avatarColor : user?.avatarColor || '#309898' }}
                                        >
                                            {(isEditing ? editForm.name : user?.name)?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}

                                    {!isEditing && user?.learningStreak && user.learningStreak > 0 && (
                                        <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white rounded-full px-2 py-1 text-xs font-bold flex items-center gap-1 shadow-md z-10">
                                            <FaFire />
                                            {user.learningStreak}
                                        </div>
                                    )}

                                    {/* Edit Mode Camera Icon overlay or button */}
                                    {isEditing && (
                                        <label className="absolute bottom-0 right-0 bg-cyan text-white w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-cyan-600 transition-colors z-20" title="Upload Photo">
                                            <FaCamera />
                                            <input
                                                type="file"
                                                accept="image/jpeg, image/png, image/jpg"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                                disabled={isUploadingImage}
                                            />
                                        </label>
                                    )}
                                </div>
                                {isEditing && profileImage && (
                                    <button
                                        onClick={handleRemoveImage}
                                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 bg-transparent font-medium transition-colors px-2 py-1 rounded-md border border-red-200 mt-1"
                                    >
                                        Remove Photo
                                    </button>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center sm:text-left">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="text-2xl font-bold text-black bg-gray-100 px-3 py-2 rounded-lg w-full sm:w-auto border-2 border-transparent focus:border-cyan focus:outline-none"
                                        placeholder="Your Name"
                                    />
                                ) : (
                                    <h2 className="text-2xl font-bold text-black">{user?.name}</h2>
                                )}
                                <p className="text-gray-500 mt-1">{user?.email}</p>

                                {isEditing ? (
                                    <textarea
                                        value={editForm.bio}
                                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                        className="mt-3 w-full bg-gray-100 px-3 py-2 rounded-lg text-gray-700 resize-none border-2 border-transparent focus:border-cyan focus:outline-none"
                                        placeholder="Write a short bio about yourself..."
                                        rows={2}
                                        maxLength={200}
                                    />
                                ) : (
                                    <p className="text-gray-600 mt-3">{user?.bio || 'No bio yet. Click Edit Profile to add one!'}</p>
                                )}

                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <FaCalendarDays className="text-cyan" />
                                        Member since {getMemberSince()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FaStar className="text-yellow-500" />
                                        {user?.points || 0} Points
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Avatar Color Picker (Edit Mode) */}
                        {isEditing && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-6 pt-6 border-t border-gray-200"
                            >
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Choose Avatar Color</h3>
                                <div className="flex flex-wrap gap-3">
                                    {AVATAR_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setEditForm({ ...editForm, avatarColor: color })}
                                            className={`w-10 h-10 rounded-full transition-all ${editForm.avatarColor === color
                                                ? 'ring-4 ring-offset-2 ring-gray-400 scale-110'
                                                : 'hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: color }}
                                        >
                                            {editForm.avatarColor === color && (
                                                <FaCheck className="text-white mx-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <motion.div
                            variants={itemVariants}
                            className="bg-gradient-to-br from-cyan to-blue-500 rounded-xl p-5 text-white shadow-lg"
                        >
                            <FaBook className="text-2xl mb-2 opacity-80" />
                            <div className="text-3xl font-bold">{stats.totalStories}</div>
                            <div className="text-sm opacity-80">Stories Read</div>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl p-5 text-white shadow-lg"
                        >
                            <FaChartLine className="text-2xl mb-2 opacity-80" />
                            <div className="text-3xl font-bold">{stats.averageScore}%</div>
                            <div className="text-sm opacity-80">Avg Score</div>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-5 text-white shadow-lg"
                        >
                            <FaFire className="text-2xl mb-2 opacity-80" />
                            <div className="text-3xl font-bold">{user?.learningStreak || 0}</div>
                            <div className="text-sm opacity-80">Day Streak</div>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl p-5 text-white shadow-lg"
                        >
                            <FaTrophy className="text-2xl mb-2 opacity-80" />
                            <div className="text-3xl font-bold">{user?.points || 0}</div>
                            <div className="text-sm opacity-80">Total Points</div>
                        </motion.div>
                    </div>

                    {/* Settings Section */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                            <FaGear className="text-gray-500" />
                            Settings
                        </h3>

                        {/* Preferred Difficulty */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preferred Difficulty
                            </label>
                            <div className="flex gap-3">
                                {['easy', 'medium', 'hard'].map((diff) => (
                                    <button
                                        key={diff}
                                        onClick={() => isEditing && setEditForm({ ...editForm, preferredDifficulty: diff })}
                                        disabled={!isEditing}
                                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all capitalize ${(isEditing ? editForm.preferredDifficulty : user?.preferredDifficulty) === diff
                                            ? 'bg-cyan text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            } ${!isEditing && 'cursor-default'}`}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="flex items-center justify-between py-4 border-t border-gray-100">
                            <div className="flex items-center gap-3">
                                <FaBell className="text-gray-400 text-xl" />
                                <div>
                                    <p className="font-medium text-black">Notifications</p>
                                    <p className="text-sm text-gray-500">Receive learning reminders</p>
                                </div>
                            </div>
                            <button
                                onClick={() => isEditing && setEditForm({ ...editForm, notificationsEnabled: !editForm.notificationsEnabled })}
                                disabled={!isEditing}
                                className={`w-12 h-7 rounded-full transition-all relative ${(isEditing ? editForm.notificationsEnabled : user?.notificationsEnabled)
                                    ? 'bg-cyan'
                                    : 'bg-gray-300'
                                    } ${!isEditing && 'cursor-default'}`}
                            >
                                <div
                                    className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-sm ${(isEditing ? editForm.notificationsEnabled : user?.notificationsEnabled)
                                        ? 'right-1'
                                        : 'left-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Change Password */}
                        <div className="flex items-center justify-between py-4 border-t border-gray-100">
                            <div className="flex items-center gap-3">
                                <FaLock className="text-gray-400 text-xl" />
                                <div>
                                    <p className="font-medium text-black">Password</p>
                                    <p className="text-sm text-gray-500">Change your password</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Change
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Password Change Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowPasswordModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                                <FaLock className="text-cyan" />
                                Change Password
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 border-2 border-transparent focus:border-cyan focus:outline-none"
                                        placeholder="Enter current password"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 border-2 border-transparent focus:border-cyan focus:outline-none"
                                        placeholder="Enter new password"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 border-2 border-transparent focus:border-cyan focus:outline-none"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={isChangingPassword}
                                    className="flex-1 py-3 bg-cyan text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50"
                                >
                                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Image View Modal */}
            <AnimatePresence>
                {showImageModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowImageModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative flex justify-center items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="absolute -top-12 right-0 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors z-10"
                            >
                                <FaXmark className="text-xl" />
                            </button>
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile Full Size"
                                    className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-cover relative z-0"
                                />
                            ) : (
                                <div
                                    className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full flex items-center justify-center text-white text-8xl sm:text-9xl md:text-[10rem] font-bold shadow-2xl relative z-0"
                                    style={{ backgroundColor: user?.avatarColor || '#309898' }}
                                >
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
