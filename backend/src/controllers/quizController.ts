import { Request, Response } from 'express';
import { Quiz, IQuiz } from '../models/Quiz';
import { Story } from '../models/Story';
import { User } from '../models/User';
import { generateQuiz, calculateQuizAnalytics, generateQuizExplanations } from '../services/quizGenerator';
import { AuthRequest } from '../middleware/auth';
import { addUserPoints } from './leaderboardController';

export const generateQuizController = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { storyId } = req.params;

    const story = await Story.findById(storyId);
    if (!story) {
      res.status(404).json({ error: 'Story not found' });
      return;
    }

    // Check if quiz already exists
    let quiz = await Quiz.findOne({ storyId });
    if (quiz && quiz.questions.length > 0) {
      res.json({
        success: true,
        quiz: {
          id: quiz._id,
          storyId: quiz.storyId,
          concept: quiz.concept || story.concept || 'General',
          questions: quiz.questions.map(q => ({
            questionNumber: q.questionNumber,
            question: q.question,
            options: q.options,
          })),
        }
      });
      return;
    }

    // Validate story has pages
    if (!story.pages || story.pages.length === 0) {
      res.status(400).json({
        error: 'Story has no pages',
        message: 'Cannot generate quiz for a story with no content',
      });
      return;
    }

    // Combine all story pages text
    let storyText = story.pages.map(p => p.text).filter(text => text && text.trim()).join('\n\n');

    if (!storyText || storyText.trim().length === 0) {
      res.status(400).json({
        error: 'Story has no text content',
        message: 'Cannot generate quiz for a story with no text content',
      });
      return;
    }

    // Limit story text length to prevent API issues (Gemini has token limits)
    const MAX_STORY_LENGTH = 50000; // ~50k characters should be safe
    if (storyText.length > MAX_STORY_LENGTH) {
      console.warn(`⚠️  Story text too long (${storyText.length} chars), truncating to ${MAX_STORY_LENGTH} chars`);
      storyText = storyText.substring(0, MAX_STORY_LENGTH) + '...';
    }

    console.log(`📝 Generating quiz for story "${story.title}" (${story.pages.length} pages, ${storyText.length} chars)`);

    // Generate quiz using AI
    const generatedQuiz = await generateQuiz({
      concept: story.concept || 'General',
      storyText,
      numberOfQuestions: 5,
      difficulty: story.difficulty || 'medium',
    });

    // Create or update quiz in database
    if (!quiz) {
      quiz = new Quiz({
        storyId: story._id,
        concept: story.concept,
        questions: generatedQuiz.questions,
        userId: authReq.userId ? authReq.userId : undefined,
      });
    } else {
      quiz.questions = generatedQuiz.questions;
    }

    await quiz.save();

    res.json({
      success: true,
      quiz: {
        id: quiz._id,
        storyId: quiz.storyId,
        concept: quiz.concept,
        questions: quiz.questions.map(q => ({
          questionNumber: q.questionNumber,
          question: q.question,
          options: q.options,
          // Don't send correctAnswer to client initially
        })),
      },
    });
  } catch (error: any) {
    console.error('❌ Error in generateQuizController:', error);
    console.error('❌ Error stack:', error?.stack);
    console.error('❌ Error details:', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      status: error?.status,
    });

    // Extract error message safely
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    // Provide more helpful error messages for quota issues
    let statusCode = 500;
    let userMessage = errorMessage;

    if (errorMessage.includes('quota') || errorMessage.includes('Quota exceeded') || errorMessage.includes('exceeded')) {
      statusCode = 429; // Too Many Requests
      userMessage = 'API quota exceeded. All Gemini API keys have reached their daily limit. Please try again tomorrow or add more API keys.';
    } else if (errorMessage.includes('fetch failed') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
      statusCode = 503; // Service Unavailable
      userMessage = 'Unable to connect to AI service. Please check your internet connection and try again.';
    }

    res.status(statusCode).json({
      success: false,
      error: 'Failed to generate quiz',
      message: userMessage,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
};

export const submitQuizController = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { quizId } = req.params;
    const { answers } = req.body; // Array of { questionNumber, selectedAnswer }

    if (!answers || !Array.isArray(answers)) {
      res.status(400).json({ error: 'Answers array is required' });
      return;
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    // Calculate results
    const results = answers.map((answer: { questionNumber: number; selectedAnswer: number }) => {
      const question = quiz.questions.find(q => q.questionNumber === answer.questionNumber);
      if (!question) {
        throw new Error(`Question ${answer.questionNumber} not found`);
      }

      return {
        questionNumber: answer.questionNumber,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: question.correctAnswer === answer.selectedAnswer,
      };
    });

    // Generate explanations for questions
    const questionsWithExplanations = await generateQuizExplanations(quiz.questions, quiz.concept);
    quiz.questions = questionsWithExplanations;

    // Calculate analytics
    const analytics = calculateQuizAnalytics(quiz.questions, results);

    // Update quiz with results
    quiz.results = results;
    quiz.score = analytics.score;
    quiz.completedAt = new Date();
    quiz.areasOfConcern = analytics.areasOfConcern;

    await quiz.save();

    // Calculate and add points to user's leaderboard score
    // Points formula: Base 10 points + bonus based on score percentage
    // Perfect score (100%) = 10 + 20 = 30 points
    // 80% score = 10 + 16 = 26 points
    // 0% score = 10 points (for completing)
    if (authReq.userId) {
      const correctAnswers = results.filter(r => r.isCorrect).length;
      const totalQuestions = results.length;
      const scorePercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

      const basePoints = 10;
      const bonusPoints = Math.round((scorePercentage / 100) * 20);
      const totalPoints = basePoints + bonusPoints;

      await addUserPoints(authReq.userId, totalPoints);
      console.log(`📊 User ${authReq.userId} earned ${totalPoints} points (score: ${scorePercentage}%)`);
    }

    res.json({
      success: true,
      quiz: {
        id: quiz._id,
        storyId: quiz.storyId,
        concept: quiz.concept,
        score: quiz.score,
        results: quiz.results,
        areasOfConcern: quiz.areasOfConcern,
        strengths: analytics.strengths,
        questions: quiz.questions.map(q => ({
          questionNumber: q.questionNumber,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        })),
      },
    });
  } catch (error) {
    console.error('Error in submitQuizController:', error);
    res.status(500).json({
      error: 'Failed to submit quiz',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getQuizController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    // If quiz is completed, include results and correct answers
    const response: any = {
      id: quiz._id,
      storyId: quiz.storyId,
      concept: quiz.concept,
      questions: quiz.questions.map(q => ({
        questionNumber: q.questionNumber,
        question: q.question,
        options: q.options,
      })),
    };

    if (quiz.completedAt) {
      response.score = quiz.score;
      response.results = quiz.results;
      response.areasOfConcern = quiz.areasOfConcern;
      response.completedAt = quiz.completedAt;
      // Include correct answers for completed quizzes
      response.questions = quiz.questions.map(q => ({
        questionNumber: q.questionNumber,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));
    }

    res.json({ success: true, quiz: response });
  } catch (error) {
    console.error('Error in getQuizController:', error);
    res.status(500).json({
      error: 'Failed to fetch quiz',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getQuizByStoryController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storyId } = req.params;
    const quiz = await Quiz.findOne({ storyId });

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found for this story' });
      return;
    }

    const response: any = {
      id: quiz._id,
      storyId: quiz.storyId,
      concept: quiz.concept,
      questions: quiz.questions.map(q => ({
        questionNumber: q.questionNumber,
        question: q.question,
        options: q.options,
      })),
    };

    if (quiz.completedAt) {
      response.score = quiz.score;
      response.results = quiz.results;
      response.areasOfConcern = quiz.areasOfConcern;
      response.completedAt = quiz.completedAt;
    }

    res.json({ success: true, quiz: response });
  } catch (error) {
    console.error('Error in getQuizByStoryController:', error);
    res.status(500).json({
      error: 'Failed to fetch quiz',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getQuizAnalyticsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const query = authReq.userId
      ? { userId: authReq.userId, completedAt: { $exists: true } }
      : { completedAt: { $exists: true } };
    const quizzes = await Quiz.find(query).sort({ completedAt: -1 });

    const analytics = {
      totalQuizzes: quizzes.length,
      averageScore: quizzes.length > 0
        ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length)
        : 0,
      recentQuizzes: quizzes.slice(0, 10).map(q => ({
        concept: q.concept,
        score: q.score,
        completedAt: q.completedAt,
        areasOfConcern: q.areasOfConcern,
      })),
      allAreasOfConcern: quizzes.reduce((acc, q) => {
        if (q.areasOfConcern) {
          q.areasOfConcern.forEach(area => {
            acc[area] = (acc[area] || 0) + 1;
          });
        }
        return acc;
      }, {} as Record<string, number>),
    };

    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Error in getQuizAnalyticsController:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getComprehensiveAnalyticsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Get user data for streak info
    const user = await User.findById(authReq.userId);

    // Get all completed quizzes for the user, sorted by completion date
    const quizzes = await Quiz.find({
      userId: authReq.userId,
      completedAt: { $exists: true }
    }).sort({ completedAt: -1 });

    // Get story IDs from completed quizzes
    const completedStoryIds = quizzes.map(q => q.storyId);

    // Get stories that have completed quizzes
    const stories = await Story.find({
      userId: authReq.userId,
      _id: { $in: completedStoryIds }
    });

    // Calculate stats
    const totalStoriesRead = quizzes.length;
    const totalTimeSpent = quizzes.reduce((sum, quiz) => {
      if (quiz.results && Array.isArray(quiz.results)) {
        const quizTime = quiz.results.reduce((qSum, result) => {
          return qSum + (result.timeSpent || 0);
        }, 0);
        return sum + quizTime;
      }
      return sum;
    }, 0);
    const totalTimeSpentMinutes = Math.round(totalTimeSpent / 60);

    const averageQuizScore = quizzes.length > 0
      ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length)
      : 0;

    // Calculate topic performance
    const topicScores: Record<string, { total: number; count: number }> = {};
    quizzes.forEach(quiz => {
      const topic = quiz.concept;
      if (!topicScores[topic]) {
        topicScores[topic] = { total: 0, count: 0 };
      }
      topicScores[topic].total += quiz.score || 0;
      topicScores[topic].count += 1;
    });

    const topicPerformance = Object.entries(topicScores).map(([topic, data]) => ({
      topic: topic.length > 20 ? topic.substring(0, 20) + '...' : topic,
      averageScore: Math.round(data.total / data.count),
      quizCount: data.count,
    })).sort((a, b) => b.averageScore - a.averageScore);

    const bestTopic = topicPerformance.length > 0 ? topicPerformance[0].topic : 'N/A';
    const worstTopic = topicPerformance.length > 1
      ? topicPerformance[topicPerformance.length - 1].topic
      : 'N/A';

    // Calculate time spent per topic
    const topicTimeSpent: Record<string, number> = {};
    quizzes.forEach(quiz => {
      const topic = quiz.concept;
      if (!topicTimeSpent[topic]) {
        topicTimeSpent[topic] = 0;
      }
      if (quiz.results && Array.isArray(quiz.results)) {
        const quizTime = quiz.results.reduce((sum, result) => {
          return sum + (result.timeSpent || 0);
        }, 0);
        topicTimeSpent[topic] += quizTime;
      }
    });

    const timeSpentData = Object.entries(topicTimeSpent).map(([topic, seconds]) => ({
      name: topic.length > 20 ? topic.substring(0, 20) + '...' : topic,
      value: Math.round(seconds / 60),
    }));

    // Genre distribution - improved detection
    const genreMapping: Record<string, string> = {
      // Fiction genres
      'fantasy': 'Fantasy',
      'magic': 'Fantasy',
      'wizard': 'Fantasy',
      'dragon': 'Fantasy',
      'fairy': 'Fantasy',
      'sci-fi': 'Sci-Fi',
      'science fiction': 'Sci-Fi',
      'space': 'Sci-Fi',
      'robot': 'Sci-Fi',
      'future': 'Sci-Fi',
      'mystery': 'Mystery',
      'detective': 'Mystery',
      'crime': 'Mystery',
      'adventure': 'Adventure',
      'explore': 'Adventure',
      'journey': 'Adventure',
      'quest': 'Adventure',
      'historical': 'Historical',
      'history': 'Historical',
      'revolution': 'Historical',
      'war': 'Historical',
      'ancient': 'Historical',
      'medieval': 'Historical',
      'superhero': 'Superhero',
      'hero': 'Superhero',
      'power': 'Superhero',
      // Educational topics as genres
      'science': 'Science',
      'math': 'Math',
      'nature': 'Nature',
      'animal': 'Nature',
      'geography': 'Geography',
    };

    const genreCounts: Record<string, number> = {};
    stories.forEach(story => {
      // Check concept, title, and keyConcepts
      const searchText = [
        story.concept || '',
        story.title || '',
        ...(story.keyConcepts || [])
      ].join(' ').toLowerCase();

      let genre = 'General';
      for (const [key, value] of Object.entries(genreMapping)) {
        if (searchText.includes(key)) {
          genre = value;
          break;
        }
      }

      // Fallback: use difficulty as category if no genre found
      if (genre === 'General' && story.difficulty) {
        const diffMap: Record<string, string> = {
          'easy': 'Beginner',
          'medium': 'Intermediate',
          'hard': 'Advanced'
        };
        genre = diffMap[story.difficulty.toLowerCase()] || 'General';
      }

      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    // Include genres that have data
    const allGenres = ['Historical', 'Science', 'Adventure', 'Fantasy', 'Mystery', 'Nature'];
    const genreDistribution = allGenres.map(genre => ({
      genre,
      stories: genreCounts[genre] || 0,
    })).filter(g => g.stories > 0);

    // If no standard genres found, show what we have
    if (genreDistribution.length === 0) {
      Object.entries(genreCounts).forEach(([genre, count]) => {
        genreDistribution.push({ genre, stories: count });
      });
    }


    // === NEW: Weekly Progress (last 7 days) ===
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyQuizzes = quizzes.filter(q => q.completedAt && new Date(q.completedAt) >= weekAgo);

    const dailyProgress: { day: string; quizzes: number; score: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayQuizzes = quizzes.filter(q => {
        if (!q.completedAt) return false;
        const completed = new Date(q.completedAt);
        return completed >= dayStart && completed <= dayEnd;
      });

      const avgScore = dayQuizzes.length > 0
        ? Math.round(dayQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) / dayQuizzes.length)
        : 0;

      dailyProgress.push({
        day: dayNames[date.getDay()],
        quizzes: dayQuizzes.length,
        score: avgScore,
      });
    }

    // === NEW: Recent Quizzes (last 10) ===
    const recentQuizzes = quizzes.slice(0, 10).map(q => ({
      concept: q.concept.length > 25 ? q.concept.substring(0, 25) + '...' : q.concept,
      score: q.score || 0,
      completedAt: q.completedAt,
      questionsCount: q.questions.length,
      correctAnswers: q.results?.filter(r => r.isCorrect).length || 0,
    }));

    // === NEW: Score Trend (last 10 quizzes, oldest to newest) ===
    const scoreTrend = quizzes.slice(0, 10).reverse().map((q, index) => ({
      quiz: index + 1,
      score: q.score || 0,
    }));

    // === NEW: Skill Level Calculation ===
    const calculateSkillLevel = (avgScore: number, totalQuizzes: number): { level: string; progress: number } => {
      if (totalQuizzes === 0) return { level: 'Beginner', progress: 0 };

      const baseScore = avgScore * 0.7;
      const experienceBonus = Math.min(totalQuizzes * 2, 30);
      const skillPoints = baseScore + experienceBonus;

      if (skillPoints >= 90) return { level: 'Master', progress: Math.min((skillPoints - 90) / 10 * 100, 100) };
      if (skillPoints >= 70) return { level: 'Expert', progress: (skillPoints - 70) / 20 * 100 };
      if (skillPoints >= 50) return { level: 'Intermediate', progress: (skillPoints - 50) / 20 * 100 };
      if (skillPoints >= 30) return { level: 'Learner', progress: (skillPoints - 30) / 20 * 100 };
      return { level: 'Beginner', progress: skillPoints / 30 * 100 };
    };

    const skillLevel = calculateSkillLevel(averageQuizScore, totalStoriesRead);

    // === NEW: Achievements ===
    const achievements = [];
    if (totalStoriesRead >= 1) achievements.push({ id: 'first_story', name: 'First Story', description: 'Completed your first story', icon: '📖', earned: true });
    if (totalStoriesRead >= 5) achievements.push({ id: 'storyteller', name: 'Storyteller', description: 'Completed 5 stories', icon: '📚', earned: true });
    if (totalStoriesRead >= 10) achievements.push({ id: 'bookworm', name: 'Bookworm', description: 'Completed 10 stories', icon: '🐛', earned: true });
    if (averageQuizScore >= 80) achievements.push({ id: 'high_achiever', name: 'High Achiever', description: 'Average score above 80%', icon: '🏆', earned: true });
    if (averageQuizScore >= 90) achievements.push({ id: 'perfectionist', name: 'Perfectionist', description: 'Average score above 90%', icon: '⭐', earned: true });
    if ((user?.learningStreak || 0) >= 3) achievements.push({ id: 'streak_starter', name: 'Streak Starter', description: '3 day learning streak', icon: '🔥', earned: true });
    if ((user?.learningStreak || 0) >= 7) achievements.push({ id: 'week_warrior', name: 'Week Warrior', description: '7 day learning streak', icon: '💪', earned: true });
    if (weeklyQuizzes.length >= 5) achievements.push({ id: 'active_learner', name: 'Active Learner', description: '5 quizzes this week', icon: '📈', earned: true });

    // Add unearned achievements
    if (totalStoriesRead < 1) achievements.push({ id: 'first_story', name: 'First Story', description: 'Complete your first story', icon: '📖', earned: false });
    if (totalStoriesRead < 5) achievements.push({ id: 'storyteller', name: 'Storyteller', description: 'Complete 5 stories', icon: '📚', earned: false });
    if (averageQuizScore < 80) achievements.push({ id: 'high_achiever', name: 'High Achiever', description: 'Get average score above 80%', icon: '🏆', earned: false });
    if ((user?.learningStreak || 0) < 3) achievements.push({ id: 'streak_starter', name: 'Streak Starter', description: 'Maintain 3 day streak', icon: '🔥', earned: false });

    // === NEW: Areas of Concern Summary ===
    const allAreasOfConcern: Record<string, number> = {};
    quizzes.forEach(q => {
      if (q.areasOfConcern) {
        q.areasOfConcern.forEach(area => {
          allAreasOfConcern[area] = (allAreasOfConcern[area] || 0) + 1;
        });
      }
    });
    const topAreasOfConcern = Object.entries(allAreasOfConcern)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([area, count]) => ({ area, count }));

    // === NEW: Accuracy Rate ===
    let totalCorrect = 0;
    let totalQuestions = 0;
    quizzes.forEach(q => {
      if (q.results) {
        totalCorrect += q.results.filter(r => r.isCorrect).length;
        totalQuestions += q.results.length;
      }
    });
    const accuracyRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    const analytics = {
      stats: {
        totalStoriesRead,
        totalTimeSpentMinutes,
        averageQuizScore,
        bestTopic,
        worstTopic,
        learningStreak: user?.learningStreak || 0,
        totalPoints: user?.points || 0,
        weeklyPoints: user?.weeklyPoints || 0,
        accuracyRate,
        totalQuestionsAnswered: totalQuestions,
        totalCorrectAnswers: totalCorrect,
        quizzesThisWeek: weeklyQuizzes.length,
      },
      topicPerformance,
      timeSpentData,
      genreDistribution,
      dailyProgress,
      recentQuizzes,
      scoreTrend,
      skillLevel,
      achievements,
      topAreasOfConcern,
    };

    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Error in getComprehensiveAnalyticsController:', error);
    res.status(500).json({
      error: 'Failed to fetch comprehensive analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

