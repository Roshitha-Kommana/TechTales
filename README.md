# StoryWizard - Interactive Learning Platform

StoryWizard is a full-stack interactive learning platform that combines storytelling, quizzes, and AI-powered features to create an engaging educational experience. The platform leverages generative AI, text-to-speech, and advanced analytics to help learners master concepts effectively.

## 🌟 Features

### Core Learning Features
- **Interactive Stories**: Immersive story-based learning content with visual design
- **Quizzes**: Adaptive quizzes with scoring and instant feedback
- **Concept Learning**: Extract and review key concepts from stories
- **Notes**: Create and manage personal notes for each story
- **Leaderboards**: Gamified learning with weekly rankings and streaks
- **Analytics**: Track progress and learning metrics

### AI & Content Features
- **AI-Powered Story Generation**: Generate educational stories using Google Generative AI
- **Text-to-Speech (TTS)**: Convert story content to audio using Deepgram
- **Multiple AI Providers**: Support for OpenAI integration
- **Smart Content**: Automatic concept extraction and question generation

### User Experience
- **Multi-Theme Support**: Choose from 8+ color themes (Default, Velvet, Black & White, Purple, Urban, Flower Shop, Retro, Pantone)
- **Responsive Design**: Fully responsive UI built with React and Tailwind CSS
- **Smooth Animations**: Framer Motion animations for engaging transitions
- **Dark Mode**: Comfortable viewing in low-light environments

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Styling**: Tailwind CSS + Custom Theme System
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **UI Components**: React Icons, Lucide React
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **Page Flip**: Page-flip for book-like experience

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **AI Services**: 
  - Google Generative AI (Gemini)
  - OpenAI API
  - Deepgram (Text-to-Speech)
- **File Upload**: Multer
- **PDF Processing**: pdf-parse, html2canvas, jsPDF
- **Validation**: Zod
- **Utilities**: CORS, dotenv

## 📋 Prerequisites

- **Node.js**: v16 or higher
- **npm**: v8 or higher
- **MongoDB**: Local or Atlas connection
- **API Keys**:
  - Google Generative AI key
  - OpenAI API key (optional)
  - Deepgram API key (optional)

## 🚀 Installation & Setup

### Clone the Repository
```bash
git clone <repository-url>
cd storyWizard-backend
```

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file** (`.env`)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/storywizard

# API Keys
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key

# JWT
JWT_SECRET=your_jwt_secret_key

# CORS
CORS_ORIGIN=http://localhost:3000
```

4. **Build TypeScript**
```bash
npm run build
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file** (`.env.local`)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📦 Running the Project

### Development Mode

**Backend** (from `backend/` directory):
```bash
npm run dev
```
The server will start on `http://localhost:5000`

**Frontend** (from `frontend/` directory):
```bash
npm start
```
The app will open on `http://localhost:3000`

### Production Build

**Backend**:
```bash
npm run build
npm start
```

**Frontend**:
```bash
npm run build
```
Optimized build files will be in the `build/` directory.

## 📁 Project Structure

```
storyWizard-backend/
├── backend/
│   ├── src/
│   │   ├── server.ts              # Express app entry point
│   │   ├── config/                # Configuration (DB, APIs)
│   │   ├── controllers/           # Route controllers
│   │   ├── models/                # Mongoose schemas
│   │   ├── routes/                # API routes
│   │   ├── services/              # Business logic
│   │   └── middleware/            # Auth, upload handlers
│   ├── dist/                      # Compiled JavaScript
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # Main app component
│   │   ├── components/            # Reusable components
│   │   ├── pages/                 # Page components
│   │   ├── services/              # API services
│   │   ├── hooks/                 # Custom hooks
│   │   ├── types/                 # TypeScript types
│   │   └── utils/                 # Utility functions
│   ├── public/
│   │   └── themes/                # CSS theme files
│   ├── build/                     # Production build
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                      # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Stories
- `GET /api/stories` - Fetch all stories
- `POST /api/stories` - Create new story
- `GET /api/stories/:id` - Get story details
- `PUT /api/stories/:id` - Update story
- `DELETE /api/stories/:id` - Delete story

### Quizzes
- `GET /api/quizzes/:storyId` - Get quiz for story
- `POST /api/quizzes/:quizId/submit` - Submit quiz answers

### Notes
- `GET /api/notes` - Fetch user notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### AI Features
- `POST /api/ai/generate-story` - Generate story with AI
- `POST /api/ai/extract-concepts` - Extract key concepts
- `POST /api/tts/generate` - Generate speech from text

### Leaderboard
- `GET /api/leaderboard` - Fetch weekly leaderboard
- `GET /api/analytics` - User analytics and progress

## 🎨 Theme Customization

The platform supports 8+ customizable themes. Theme files are located in `/frontend/public/themes/`:

- `theme-default.css` - Default warm theme
- `theme-velvet.css` - Velvet cream theme
- `theme-bw.css` - Black & White dark theme
- `theme-purple.css` - Purple theme
- `theme-urban.css` - Urban nature theme
- `theme-flower.css` - Flower shop theme
- `theme-retro.css` - Retro oasis theme
- `theme-pantone.css` - Pantone theme

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Configured CORS for API security
- **Request Validation**: Zod schemas for input validation
- **Environment Variables**: Sensitive data protected via `.env`

## 🚀 Performance Optimizations

- **Code Splitting**: React lazy loading for routes
- **Image Optimization**: Efficient asset handling
- **Caching**: Browser caching strategies
- **Database Indexing**: Optimized MongoDB queries
- **CDN Ready**: Minified and optimized production builds

## 🧪 Running Tests

Currently, the project uses TypeScript for type safety. Testing framework can be added as needed:

```bash
npm test
```

## 📝 Environment Variables Reference

### Backend `.env`
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `GOOGLE_API_KEY` | Google Generative AI key | `AIza...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `DEEPGRAM_API_KEY` | Deepgram API key | `...` |

### Frontend `.env.local`
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running
- Check connection string in `.env`
- Ensure network access is allowed

### API Key Issues
- Verify all required API keys are set in `.env`
- Check key validity and quotas
- Review provider documentation

### Port Already in Use
```bash
# Kill process on port 5000
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For support, please:
- Open an issue on GitHub
- Contact the development team
- Check existing documentation

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] Advanced analytics dashboard
- [ ] Certification programs
- [ ] Community features
- [ ] API documentation portal

---

**Last Updated**: April 6, 2026
**Version**: 1.0.0
