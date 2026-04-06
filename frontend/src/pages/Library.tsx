import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Story } from '../types';
import { storiesApi } from '../services/api';
import toast from 'react-hot-toast';
import { FaTrashAlt } from 'react-icons/fa';

const Library: React.FC = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setIsLoading(true);
    try {
      const response = await storiesApi.getAll();
      if (response.success && response.stories) {
        setStories(response.stories);
      }
    } catch (error: any) {
      console.error('Error loading stories:', error);
      const errorMsg = error?.message || error?.error || 'Failed to load stories. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStory = async (storyId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this story?')) {
      return;
    }

    try {
      await storiesApi.delete(storyId);
      setStories(prevStories => prevStories.filter(s => s.id !== storyId));
      toast.success('Story deleted successfully');
    } catch (error: any) {
      console.error('Error deleting story:', error);
      toast.error(error?.message || 'Failed to delete story');
    }
  };

  const handleShareStory = async (storyId: string, e: React.MouseEvent) => {
    e.stopPropagation();

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">My Story Library</h1>
          <button
            onClick={() => navigate('/')}
            className="text-primary-600 hover:text-primary-700 font-semibold text-sm sm:text-base min-h-[44px]"
          >
            ← Create New Story
          </button>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-gray-600 mb-4 text-sm sm:text-base">No stories yet.</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 min-h-[44px] text-sm sm:text-base"
            >
              Create Your First Story
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {stories.map((story) => {
              if (!story.id) {
                console.warn('Story missing ID:', story);
                return null;
              }
              return (
                <div
                  key={story.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow min-h-[44px] relative group"
                >
                  {/* Action buttons - appear on hover */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    {/* View button */}
                    <button
                      onClick={(e) => story.id && handleViewStory(story.id, e)}
                      className="w-8 h-8 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full flex items-center justify-center shadow-md"
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
                        className="w-full h-40 sm:h-44 md:h-48 object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="p-4 sm:p-5 md:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{story.title}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2">Concept: {story.concept}</p>
                      <p className="text-gray-500 text-xs">
                        {story.pages.length} pages • {story.difficulty || 'medium'} difficulty
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
