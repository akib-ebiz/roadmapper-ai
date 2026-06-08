# Roadmapper AI

AI-Powered Course Builder — Full-stack LMS platform with Gemini + Groq AI integration.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express.js
- **Database**: MongoDB Atlas
- **AI**: Google Gemini + Groq
- **Auth**: JWT + bcrypt
- **Deployment**: Vercel (frontend) + Render (backend)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas account
- Gemini API key
- Groq API key

### Installation

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd client && npm install
```

### Environment Variables

**Server** (`server/.env`):
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Run Development

```bash
# Start server
cd server && npm run dev

# Start client (separate terminal)
cd client && npm run dev
```

### Run Tests

```bash
# Server tests
cd server && npm test

# Client tests
cd client && npm test
```

## Project Structure

```
roadmapper-ai/
├── client/          # React frontend
├── server/          # Express backend
├── docs/            # Project documentation
└── README.md
```

## API

Base URL: `http://localhost:5000/api/v1`

- `GET  /api/v1/health` — Health check
- `POST /api/v1/auth/register` — Register user
- `POST /api/v1/auth/login` — Login user
- `GET  /api/v1/auth/me` — Current user

## License

MIT
