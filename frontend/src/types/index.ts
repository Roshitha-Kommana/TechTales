export interface Story {
  id: string;
  title: string;
  concept: string;
  pages: StoryPage[];
  ageGroup?: string;
  difficulty?: string;
  keyConcepts?: string[];
  createdAt?: string;
}

export interface StoryPage {
  pageNumber: number;
  text: string;
  imageUrl?: string;
  imagePrompt?: string;
  keyPoints?: string[]; // Educational key points for this page
}


export interface Concept {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
}

export interface QuizQuestion {
  questionNumber: number;
  question: string;
  options: string[];
  correctAnswer?: number;
  explanation?: string;
}

export interface QuizResult {
  questionNumber: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent?: number;
}

export interface Quiz {
  id: string;
  storyId: string;
  concept: string;
  questions: QuizQuestion[];
  results?: QuizResult[];
  score?: number;
  completedAt?: string;
  areasOfConcern?: string[];
  strengths?: string[];
}

export interface QuizAnalytics {
  totalQuizzes: number;
  averageScore: number;
  recentQuizzes: Array<{
    concept: string;
    score: number;
    completedAt: string;
    areasOfConcern?: string[];
  }>;
  allAreasOfConcern: Record<string, number>;
}

export interface ComprehensiveAnalytics {
  stats: {
    totalStoriesRead: number;
    totalTimeSpentMinutes: number;
    averageQuizScore: number;
    bestTopic: string;
    worstTopic?: string;
    learningStreak?: number;
    totalPoints?: number;
    weeklyPoints?: number;
    accuracyRate?: number;
    totalQuestionsAnswered?: number;
    totalCorrectAnswers?: number;
    quizzesThisWeek?: number;
  };
  topicPerformance: Array<{
    topic: string;
    averageScore: number;
    quizCount?: number;
  }>;
  timeSpentData: Array<{
    name: string;
    value: number;
  }>;
  genreDistribution: Array<{
    genre: string;
    stories: number;
  }>;
  dailyProgress?: Array<{
    day: string;
    quizzes: number;
    score: number;
  }>;
  recentQuizzes?: Array<{
    concept: string;
    score: number;
    completedAt: string;
    questionsCount: number;
    correctAnswers: number;
  }>;
  scoreTrend?: Array<{
    quiz: number;
    score: number;
  }>;
  skillLevel?: {
    level: string;
    progress: number;
  };
  achievements?: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
  }>;
  topAreasOfConcern?: Array<{
    area: string;
    count: number;
  }>;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  storyId?: string;
  storyTitle?: string;
  pageNumber?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  email: string;
  points: number;
  weeklyPoints: number;
  learningStreak: number;
}

export interface WeekInfo {
  startDate: string;
  endDate: string;
  displayRange: string;
}

export interface LeaderboardData {
  leaderboard: LeaderboardUser[];
  weekInfo: WeekInfo;
  currentUser: {
    id: string;
    email: string;
    name: string;
    points: number;
    weeklyPoints: number;
    learningStreak: number;
    rank: number | null;
  } | null;
}


