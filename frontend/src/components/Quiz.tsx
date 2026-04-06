import React, { useState, useEffect } from 'react';
import { Quiz as QuizType, QuizQuestion } from '../types';

interface QuizProps {
  quiz: QuizType;
  onSubmit: (answers: Array<{ questionNumber: number; selectedAnswer: number }>) => void;
  isLoading?: boolean;
}

const Quiz: React.FC<QuizProps> = ({ quiz, onSubmit, isLoading }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (quiz.results && quiz.results.length > 0) {
      setShowResults(true);
      const resultsMap: Record<number, number> = {};
      quiz.results.forEach((result) => {
        resultsMap[result.questionNumber] = result.selectedAnswer;
      });
      setAnswers(resultsMap);
    }
  }, [quiz]);

  const handleAnswerSelect = (questionNumber: number, optionIndex: number) => {
    if (showResults) return;
    setAnswers({ ...answers, [questionNumber]: optionIndex });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const answerArray = Object.entries(answers).map(([questionNumber, selectedAnswer]) => ({
      questionNumber: parseInt(questionNumber),
      selectedAnswer,
    }));
    onSubmit(answerArray);
  };

  const isAllAnswered = Object.keys(answers).length === quiz.questions.length;
  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Quiz: {quiz.concept}</h2>
        <p className="text-gray-600 text-sm sm:text-base">Test your understanding of the story</p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm text-gray-600">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
          <span className="text-xs sm:text-sm text-gray-600">
            {Object.keys(answers).length} / {quiz.questions.length} answered
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
          {currentQ.question}
        </h3>

        <div className="space-y-2 sm:space-y-3">
          {currentQ.options.map((option, index) => {
            const isSelected = answers[currentQ.questionNumber] === index;
            const isCorrect = showResults && currentQ.correctAnswer === index;
            const isWrong = showResults && isSelected && currentQ.correctAnswer !== index;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQ.questionNumber, index)}
                disabled={showResults || isLoading}
                className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all min-h-[44px] ${isSelected
                    ? isCorrect
                      ? 'border-green-500 bg-green-50'
                      : isWrong
                        ? 'border-red-500 bg-red-50'
                        : 'border-purple-400 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  } ${showResults && isCorrect ? 'ring-2 ring-green-500' : ''}`}
              >
                <div className="flex items-center">
                  <span className="font-semibold mr-2 sm:mr-3 text-gray-600 text-sm sm:text-base">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="text-gray-800 text-sm sm:text-base">{option}</span>
                  {showResults && isCorrect && (
                    <span className="ml-auto text-green-600 font-bold text-lg">✓</span>
                  )}
                  {showResults && isWrong && (
                    <span className="ml-auto text-red-600 font-bold text-lg">✗</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {showResults && currentQ.explanation && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-xs sm:text-sm text-gray-700">
              <strong>Explanation:</strong> {currentQ.explanation}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors min-h-[44px] text-sm sm:text-base"
        >
          ← Previous
        </button>

        <div className="flex gap-1.5 sm:gap-2 order-3 sm:order-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full min-w-[10px] min-h-[10px] ${index === currentQuestion
                  ? 'bg-primary-600'
                  : answers[index] !== undefined
                    ? 'bg-primary-300'
                    : 'bg-gray-300'
                }`}
            />
          ))}
        </div>

        {currentQuestion < quiz.questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors min-h-[44px] text-sm sm:text-base order-2 sm:order-3"
          >
            Next →
          </button>
        ) : (
          !showResults && (
            <button
              onClick={handleSubmit}
              disabled={!isAllAnswered || isLoading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors min-h-[44px] text-sm sm:text-base order-2 sm:order-3"
            >
              {isLoading ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default Quiz;


