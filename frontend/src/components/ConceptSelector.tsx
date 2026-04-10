import React, { useState } from 'react';
import { FaStar, FaBolt } from 'react-icons/fa';
import { authApi } from '../services/auth';

interface ConceptSelectorProps {
  onSelect: (
    concept: string,
    characterName: string,
    adventureStyle: string,
    difficulty: string,
    file?: File
  ) => void;
  isLoading?: boolean;
  onClose?: () => void;
}

const adventureStyles = [
  {
    id: 'fantasy',
    name: 'Fantasy',
    emoji: '🧙',
    description: 'Magic and mythical creatures',
  },
  {
    id: 'sci-fi',
    name: 'Sci-Fi',
    emoji: '🚀',
    description: 'Space and future tech',
  },
  {
    id: 'mystery',
    name: 'Mystery',
    emoji: '🔍',
    description: 'Puzzles and detective work',
  },
  {
    id: 'superhero',
    name: 'Superhero',
    emoji: '🦸',
    description: 'Powers and heroic adventures',
  },
  {
    id: 'historical',
    name: 'Historical',
    emoji: '🏛️',
    description: 'Past civilizations and events',
  },
  {
    id: 'adventure',
    name: 'Adventure',
    emoji: '🗺️',
    description: 'Exploration and quests',
  },
  {
    id: 'none',
    name: 'None',
    emoji: '📚',
    description: 'Direct explanation with examples',
  },
];

const ConceptSelector: React.FC<ConceptSelectorProps> = ({ onSelect, isLoading, onClose }) => {
  const [concept, setConcept] = useState('');
  const [characterName, setCharacterName] = useState(() => {
    const user = authApi.getUser();
    return user?.name || '';
  });
  const [selectedStyle, setSelectedStyle] = useState<string>('fantasy');
  const [difficulty, setDifficulty] = useState('advanced');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      const allowedTypes = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'text/plain',
        'text/markdown',
      ];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Allowed types: PDF, PNG, JPG, JPEG, TXT, MD');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById('sourceFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (concept.trim()) {
      onSelect(
        concept.trim(),
        characterName.trim() || 'Adventurer',
        selectedStyle,
        difficulty,
        selectedFile || undefined
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <FaStar className="text-purple-600 text-xl" />
          <h2 className="text-2xl font-bold text-gray-900">Create Your Story</h2>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Minimize"
              >
                <span className="text-lg">↑</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <span className="text-xl font-bold">×</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-white overflow-y-auto max-h-[calc(100vh-200px)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* What do you want to learn? */}
          <div>
            <label
              htmlFor="concept"
              className="block text-base font-semibold text-gray-800 mb-2"
            >
              What do you want to learn?
            </label>
            <input
              type="text"
              id="concept"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g., Deep Learning, Photosynthesis, Machine Learning..."
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base text-gray-900 placeholder-gray-400 min-h-[44px]"
              required
              disabled={isLoading}
            />
          </div>

          {/* Character Name */}
          <div>
            <label
              htmlFor="characterName"
              className="block text-sm sm:text-base font-semibold text-gray-800 mb-2"
            >
              Your character name
            </label>
            <input
              type="text"
              id="characterName"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="Enter your character's name"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base text-gray-900 placeholder-gray-400 min-h-[44px]"
              disabled={isLoading}
            />
          </div>

          {/* Adventure Style */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-3">
              Choose your adventure style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {adventureStyles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  disabled={isLoading}
                  className={`
                    relative p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 text-left min-h-[44px]
                    ${selectedStyle === style.id
                      ? 'border-purple-600 bg-purple-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{style.emoji}</div>
                    <div
                      className={`font-semibold text-xs sm:text-sm mb-1 ${selectedStyle === style.id ? 'text-purple-700' : 'text-gray-700'
                        }`}
                    >
                      {style.name}
                    </div>
                    <div
                      className={`text-xs ${selectedStyle === style.id ? 'text-purple-600' : 'text-gray-500'
                        }`}
                    >
                      {style.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <label
              htmlFor="difficulty"
              className="block text-base font-semibold text-gray-800 mb-2"
            >
              Difficulty Level
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base text-gray-900 appearance-none cursor-pointer min-h-[44px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                paddingRight: '2.5rem',
              }}
              disabled={isLoading}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-2">
              Source File (Optional)
            </label>
            <p className="text-xs sm:text-sm text-gray-600 mb-3">
              Upload a PDF, image, or text file to use as source material
            </p>
            {!selectedFile ? (
              <label
                htmlFor="sourceFile"
                className="flex flex-col items-center justify-center w-full h-24 sm:h-28 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors min-h-[44px]"
              >
                <div className="flex flex-col items-center justify-center">
                  <FaBolt className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-gray-400" />
                  <p className="mb-1 text-xs sm:text-sm text-gray-600">
                    <span className="font-semibold text-gray-700">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, PNG, JPG, TXT, MD (MAX. 10MB)</p>
                </div>
                <input
                  id="sourceFile"
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 border border-gray-300 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <FaBolt className="text-gray-500 text-sm sm:text-base flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex-shrink-0 ml-2"
                  disabled={isLoading}
                >
                  <span className="text-xl font-bold">×</span>
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !concept.trim()}
              className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 text-white py-3 sm:py-4 px-4 sm:px-8 rounded-lg font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating Story & Quiz...</span>
                </>
              ) : (
                <>
                  <FaBolt className="text-yellow-300" />
                  <span>Generate Story & Quiz</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConceptSelector;
