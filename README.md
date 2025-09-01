# Intervu.Prep - Backend

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/interview-prep-ai

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Server Configuration
PORT=8000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=5242880
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/upload-image` - Upload profile image

### Sessions

- `POST /api/sessions/create` - Create a new interview session
- `GET /api/sessions/my-sessions` - Get user's sessions
- `GET /api/sessions/:id` - Get session by ID
- `DELETE /api/sessions/:id` - Delete session

### Questions

- `POST /api/questions/add` - Add questions to session
- `PUT /api/questions/:id/pin` - Toggle question pin status
- `PUT /api/questions/:id/note` - Update question note

### AI

- `POST /api/ai/generate-questions` - Generate interview questions
- `POST /api/ai/generate-explanation` - Generate concept explanation

## Database Models

### User

- `_id`: ObjectId
- `name`: String
- `email`: String (unique)
- `password`: String (hashed)
- `profileImage`: String (URL)
- `createdAt`: Date
- `updatedAt`: Date

### Session

- `_id`: ObjectId
- `user`: ObjectId (ref: User)
- `role`: String
- `experience`: String
- `description`: String
- `topicsToFocus`: String
- `questions`: [ObjectId] (ref: Question)
- `createdAt`: Date
- `updatedAt`: Date

### Question

- `_id`: ObjectId
- `session`: ObjectId (ref: Session)
- `question`: String
- `answer`: String
- `note`: String
- `isPinned`: Boolean
- `createdAt`: Date
- `updatedAt`: Date
