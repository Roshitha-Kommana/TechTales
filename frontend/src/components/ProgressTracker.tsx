import React from 'react';
import { QuizAnalytics } from '../types';

interface ProgressTrackerProps {
  analytics: QuizAnalytics;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ analytics }) => {
  const topConcerns = Object.entries(analytics.allAreasOfConcern)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Learning Analytics</h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-blue-50 rounded-lg shadow">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {analytics.totalQuizzes}
          </div>
          <div className="text-gray-700">Total Quizzes</div>
        </div>

        <div className="p-6 bg-green-50 rounded-lg shadow">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {analytics.averageScore}%
          </div>
          <div className="text-gray-700">Average Score</div>
        </div>

        <div className="p-6 bg-purple-50 rounded-lg shadow">
          <div className="text-4xl font-bold text-purple-600 mb-2">
            {topConcerns.length}
          </div>
          <div className="text-gray-700">Areas to Focus</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Quizzes</h3>
          <div className="space-y-3">
            {analytics.recentQuizzes.length > 0 ? (
              analytics.recentQuizzes.map((quiz, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800">{quiz.concept}</span>
                    <span
                      className={`font-bold ${
                        quiz.score >= 80
                          ? 'text-green-600'
                          : quiz.score >= 60
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {quiz.score}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(quiz.completedAt).toLocaleDateString()}
                  </div>
                  {quiz.areasOfConcern && quiz.areasOfConcern.length > 0 && (
                    <div className="mt-2 text-xs text-red-600">
                      Concerns: {quiz.areasOfConcern.slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600">No quizzes completed yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Areas of Concern</h3>
          {topConcerns.length > 0 ? (
            <div className="space-y-3">
              {topConcerns.map(([concern, count], index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-800">{concern}</span>
                  <span className="text-red-600 font-semibold">
                    {count} {count === 1 ? 'time' : 'times'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No areas of concern identified yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;


