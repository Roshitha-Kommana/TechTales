import React from 'react';
import { Quiz } from '../types';

interface QuizResultsProps {
  quiz: Quiz;
}

const QuizResults: React.FC<QuizResultsProps> = ({ quiz }) => {
  if (!quiz.score && quiz.score !== 0) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Quiz Results</h2>
        <div className={`inline-block p-6 sm:p-8 rounded-full ${getScoreBgColor(quiz.score)}`}>
          <div className={`text-4xl sm:text-5xl md:text-6xl font-bold ${getScoreColor(quiz.score)}`}>
            {quiz.score}%
          </div>
          <div className="text-gray-600 mt-2 text-sm sm:text-base">Your Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
        <div className="p-4 sm:p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Areas of Strength</h3>
          {quiz.strengths && quiz.strengths.length > 0 ? (
            <ul className="space-y-1.5 sm:space-y-2">
              {quiz.strengths.map((strength, index) => (
                <li key={index} className="text-gray-700 flex items-center text-xs sm:text-sm">
                  <span className="text-green-600 mr-2">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-xs sm:text-sm">Keep practicing to identify strengths!</p>
          )}
        </div>

        <div className="p-4 sm:p-6 bg-red-50 rounded-lg border-l-4 border-red-500">
          <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Areas for Improvement</h3>
          {quiz.areasOfConcern && quiz.areasOfConcern.length > 0 ? (
            <ul className="space-y-1.5 sm:space-y-2">
              {quiz.areasOfConcern.map((concern, index) => (
                <li key={index} className="text-gray-700 flex items-center text-xs sm:text-sm">
                  <span className="text-red-600 mr-2">⚠</span>
                  {concern}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-xs sm:text-sm">Great job! No major concerns.</p>
          )}
        </div>
      </div>

      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Performance Summary</h3>
        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
          <p>
            You answered{' '}
            <strong className="text-gray-800">
              {quiz.results?.filter((r) => r.isCorrect).length || 0} out of{' '}
              {quiz.questions.length}
            </strong>{' '}
            questions correctly.
          </p>
          {quiz.completedAt && (
            <p>
              Completed on:{' '}
              <strong className="text-gray-800">
                {new Date(quiz.completedAt).toLocaleString()}
              </strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;


