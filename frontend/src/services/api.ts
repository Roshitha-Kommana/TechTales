import axios from 'axios';

// Ensure we have a valid base URL
let API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Ensure the base URL is complete and valid
if (!API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
  API_BASE_URL = `http://${API_BASE_URL}`;
}

// Ensure /api is included in the base URL if not already present
if (!API_BASE_URL.includes('/api') && !API_BASE_URL.endsWith('/api')) {
  // If it ends with a port number, add /api
  if (API_BASE_URL.match(/:\d+$/)) {
    API_BASE_URL = `${API_BASE_URL}/api`;
  } else if (!API_BASE_URL.endsWith('/api')) {
    API_BASE_URL = `${API_BASE_URL}/api`;
  }
}

// Remove trailing slash if present (but keep /api)
API_BASE_URL = API_BASE_URL.replace(/\/+$/, '');

// Debug: Log the base URL being used
console.log('[API Config] Base URL:', API_BASE_URL);
console.log('[API Config] REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug: Verify the axios instance has the correct baseURL
console.log('[API Config] Axios instance baseURL:', api.defaults.baseURL);

// Add token to requests if available
const updateAuthToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Set initial token
updateAuthToken();

// Interceptor to update token on each request
api.interceptors.request.use(
  (config) => {
    updateAuthToken();

    // Use defaults.baseURL if config.baseURL is not set
    if (!config.baseURL) {
      config.baseURL = api.defaults.baseURL;
    }

    // Ensure baseURL always includes /api
    if (config.baseURL && !config.baseURL.includes('/api')) {
      // If baseURL doesn't have /api, add it
      if (config.baseURL.match(/:\d+$/)) {
        // Ends with port number, add /api
        config.baseURL = `${config.baseURL}/api`;
      } else if (!config.baseURL.endsWith('/api')) {
        config.baseURL = `${config.baseURL}/api`;
      }
    }

    // Also update defaults.baseURL to ensure consistency
    if (config.baseURL && config.baseURL !== api.defaults.baseURL) {
      api.defaults.baseURL = config.baseURL;
    }

    // Debug: Log the full URL being requested
    const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
    console.log('[API Request]', config.method?.toUpperCase(), fullUrl);
    console.log('[API Request Debug] baseURL:', config.baseURL, 'url:', config.url, 'defaults.baseURL:', api.defaults.baseURL);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      const isConnectionRefused = error.message?.includes('ERR_CONNECTION_REFUSED') ||
        error.message?.includes('Network Error') ||
        error.code === 'ECONNREFUSED';

      if (isConnectionRefused) {
        console.error('Backend server is not running. Please start the backend server.');
        return Promise.reject({
          message: 'Backend server is not running. Please start the server at http://localhost:5000',
          isNetworkError: true,
          isConnectionRefused: true,
        });
      }

      console.error('Network error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        isNetworkError: true,
      });
    }

    // Handle 401 errors (unauthorized) - will be handled by auth.ts interceptor
    // Handle other errors
    return Promise.reject(error);
  }
);

// Stories API
export const storiesApi = {
  generate: async (data: {
    concept: string;
    characterName?: string;
    adventureStyle?: string;
    difficulty?: string;
    numberOfPages?: number;
    file?: File;
  }) => {
    try {
      // If file is provided, use FormData; otherwise use JSON
      if (data.file) {
        const formData = new FormData();
        formData.append('concept', data.concept);
        if (data.characterName) formData.append('characterName', data.characterName);
        if (data.adventureStyle) formData.append('adventureStyle', data.adventureStyle);
        if (data.difficulty) formData.append('difficulty', data.difficulty);
        if (data.numberOfPages) formData.append('numberOfPages', data.numberOfPages.toString());
        formData.append('sourceFile', data.file);

        const response = await api.post('/stories/generate', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // No file, use regular JSON request
        const { file, ...jsonData } = data;
        const response = await api.post('/stories/generate', jsonData);
        return response.data;
      }
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to generate story', message: error.message };
    }
  },
  getById: async (id: string) => {
    try {
      const response = await api.get(`/stories/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch story', message: error.message };
    }
  },
  getAll: async () => {
    try {
      const response = await api.get('/stories');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch stories', message: error.message };
    }
  },
  generateImages: async (id: string) => {
    try {
      const response = await api.post(`/stories/${id}/images`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to generate images', message: error.message };
    }
  },
  save: async (id: string) => {
    try {
      const response = await api.post(`/stories/${id}/save`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to save story', message: error.message };
    }
  },
  updatePageText: async (id: string, pageNumber: number, text: string) => {
    try {
      const response = await api.put(`/stories/${id}/pages/${pageNumber}`, { text });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to update page text', message: error.message };
    }
  },
  updatePageImage: async (id: string, pageNumber: number, imageFile: File) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const response = await api.put(`/stories/${id}/pages/${pageNumber}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to update page image', message: error.message };
    }
  },
  getShareableLink: async (id: string) => {
    try {
      const response = await api.get(`/stories/${id}/share`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to get shareable link', message: error.message };
    }
  },
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/stories/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to delete story', message: error.message };
    }
  },
};


// Concepts API
export const conceptsApi = {
  getAll: async () => {
    try {
      const response = await api.get('/concepts');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch concepts', message: error.message };
    }
  },
  create: async (data: {
    name: string;
    description: string;
    category: string;
    difficulty?: string;
  }) => {
    try {
      const response = await api.post('/concepts', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to create concept', message: error.message };
    }
  },
};

// Quizzes API
export const quizzesApi = {
  generate: async (storyId: string) => {
    try {
      const response = await api.post(`/quizzes/story/${storyId}/generate`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to generate quiz', message: error.message };
    }
  },
  getByStory: async (storyId: string) => {
    try {
      const response = await api.get(`/quizzes/story/${storyId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch quiz', message: error.message };
    }
  },
  getById: async (quizId: string) => {
    try {
      const response = await api.get(`/quizzes/${quizId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch quiz', message: error.message };
    }
  },
  submit: async (quizId: string, answers: Array<{ questionNumber: number; selectedAnswer: number }>) => {
    try {
      const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to submit quiz', message: error.message };
    }
  },
  getAnalytics: async (studentId?: string) => {
    try {
      const url = studentId ? `/quizzes/analytics/${studentId}` : '/quizzes/analytics';
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch analytics', message: error.message };
    }
  },
  getComprehensiveAnalytics: async () => {
    try {
      const response = await api.get('/quizzes/analytics/comprehensive');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch comprehensive analytics', message: error.message };
    }
  },
};

// Feedback API
export const feedbackApi = {
  generate: async (score: number, topic: string, totalQuestions: number) => {
    try {
      const response = await api.post('/feedback/generate', {
        score,
        topic,
        totalQuestions,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to generate feedback', message: error.message };
    }
  },
};

// Leaderboard API
export const leaderboardApi = {
  getLeaderboard: async () => {
    try {
      const response = await api.get('/leaderboard');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch leaderboard', message: error.message };
    }
  },
};

// Notes API
export const notesApi = {
  create: async (data: {
    title: string;
    content: string;
    storyId?: string;
    storyTitle?: string;
    pageNumber?: number;
  }) => {
    try {
      const response = await api.post('/notes', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to create note', message: error.message };
    }
  },
  getAll: async () => {
    try {
      const response = await api.get('/notes');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch notes', message: error.message };
    }
  },
  getById: async (id: string) => {
    try {
      const response = await api.get(`/notes/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch note', message: error.message };
    }
  },
  update: async (id: string, data: { title?: string; content?: string }) => {
    try {
      const response = await api.put(`/notes/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to update note', message: error.message };
    }
  },
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/notes/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to delete note', message: error.message };
    }
  },
};

export const ttsApi = {
  speak: async (text: string, model: string = 'aura-asteria-en'): Promise<Blob> => {
    try {
      const response = await api.post('/tts/speak', { text, model }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to generate TTS', message: error.message };
    }
  }
};

export default api;

