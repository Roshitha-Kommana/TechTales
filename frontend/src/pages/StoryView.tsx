import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StoryBook from '../components/StoryBook';
import Quiz from '../components/Quiz';
import QuizResults from '../components/QuizResults';
import KeyConceptsDisplay from '../components/KeyConceptsDisplay';
import FeedbackModal from '../components/FeedbackModal';
import { Story, Quiz as QuizType, StoryPage } from '../types';
import { storiesApi, quizzesApi } from '../services/api';
import toast from 'react-hot-toast';

const StoryView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showKeyConcepts, setShowKeyConcepts] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  const loadStory = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await storiesApi.getById(id);
      if (response.success && response.story) {
        setStory(response.story);
        // Generate images if not already generated
        if (response.story.pages.some((p: StoryPage) => !p.imageUrl)) {
          console.log('Some pages missing images, generating prompts with Gemini and images with Pollinations...');
          try {
            const imagesResponse = await storiesApi.generateImages(id);
            console.log('Image generation response:', imagesResponse);
            
            // Reload story to get images
            const updatedResponse = await storiesApi.getById(id);
            if (updatedResponse.success && updatedResponse.story) {
              console.log('Story updated with images:', updatedResponse.story.pages.map((p: StoryPage) => ({
                page: p.pageNumber,
                hasImage: !!p.imageUrl
              })));
              setStory(updatedResponse.story);
            }
          } catch (error: any) {
            console.error('❌ Error generating images:', error);
            console.error('❌ Error details:', error?.response?.data || error?.message || error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
            toast.error(`Failed to generate images: ${errorMessage}`);
            // Continue with story even if images fail
          }
        } else {
          console.log('All pages already have images');
        }
      }
    } catch (error: any) {
      console.error('Error loading story:', error);
      const errorMsg = error?.message || error?.error || 'Failed to load story. Please try again.';
      toast.error(errorMsg);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadStory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStoryEnd = async () => {
    if (!id || !story) return;
    // Show key concepts first
    if (story.keyConcepts && story.keyConcepts.length > 0) {
      setShowKeyConcepts(true);
    } else {
      // If no key concepts, proceed directly to quiz generation
      await generateQuiz();
    }
  };

  const generateQuiz = async () => {
    if (!id) return;
    setIsGeneratingQuiz(true);
    try {
      const response = await quizzesApi.generate(id);
      if (response.success && response.quiz) {
        setQuiz(response.quiz);
        setShowQuiz(true);
        setShowKeyConcepts(false);
      }
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      const errorMsg = error?.message || error?.error || 'Failed to generate quiz. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleQuizSubmit = async (answers: Array<{ questionNumber: number; selectedAnswer: number }>) => {
    if (!quiz || !story) return;
    setIsSubmittingQuiz(true);
    try {
      const response = await quizzesApi.submit(quiz.id, answers);
      if (response.success && response.quiz) {
        setQuiz(response.quiz);
        // Show feedback modal after quiz completion
        if (response.quiz.score !== undefined) {
          setShowFeedback(true);
        }
      }
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      const errorMsg = error?.message || error?.error || 'Failed to submit quiz. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Story not found.</p>
          <button
            onClick={() => navigate('/')}
            className="text-black hover:text-cyan font-semibold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (showKeyConcepts && story) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-papaya py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          <KeyConceptsDisplay keyConcepts={story.keyConcepts || []} />
          <div className="text-center mt-6">
            <button
              onClick={generateQuiz}
              disabled={isGeneratingQuiz}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-cyan text-white rounded-lg font-semibold hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] text-sm sm:text-base"
            >
              {isGeneratingQuiz ? 'Generating Quiz...' : 'Take Quiz'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showQuiz && quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-papaya py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          {quiz.score !== undefined ? (
            <>
              <QuizResults quiz={quiz} />
              <FeedbackModal
                isOpen={showFeedback}
                onClose={() => setShowFeedback(false)}
                score={quiz.score || 0}
                topic={quiz.concept || story.concept || 'this topic'}
                totalQuestions={quiz.questions.length}
              />
              <div className="text-center mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={() => navigate('/analytics')}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-cyan text-white rounded-lg font-semibold hover:bg-cyan-500 min-h-[44px] text-sm sm:text-base"
                >
                  View Analytics
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 min-h-[44px] text-sm sm:text-base"
                >
                  Create New Story
                </button>
              </div>
            </>
          ) : (
            <>
              <Quiz quiz={quiz} onSubmit={handleQuizSubmit} isLoading={isSubmittingQuiz} />
              <div className="text-center mt-4 sm:mt-6">
                <button
                  onClick={() => navigate('/')}
                  className="text-black hover:text-cyan font-semibold min-h-[44px] text-sm sm:text-base"
                >
                  Skip Quiz
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (isGeneratingQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating quiz...</p>
        </div>
      </div>
    );
  }

  const handleStoryUpdate = (updatedStory: Story) => {
    setStory(updatedStory);
  };

  return <StoryBook story={story} onStoryEnd={handleStoryEnd} onStoryUpdate={handleStoryUpdate} />;
};

export default StoryView;

