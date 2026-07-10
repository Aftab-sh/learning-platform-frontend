LearnBridge – Frontend

React-based frontend for LearnBridge, a role-based Learning Management System that provides an interactive learning experience for students and teachers.

🔗 Live Demo: learning-platform-frontend-delta.vercel.app
🔗 Backend Repo: learning-platform-backend


Features

Student


Registration & login
Course enrollment
Module-based, step-by-step learning
Quiz attempt system
Coding practice with instant evaluation
Live quiz participation
Progress tracking dashboard


Teacher


Course creation
Module management
Quiz management
Coding problem management
Live quiz creation
Student analytics



Tech Stack

CategoryTechnologyLibraryReact.jsRoutingReact Router DOMHTTP ClientAxiosStylingTailwind CSSReal-timeWebSocket ClientAuthJWT


Folder Structure

src/
├── components/    # Reusable UI components
├── pages/
│   ├── auth/      # Login, Register, Password reset
│   ├── student/   # Student-facing pages
│   └── teacher/   # Teacher-facing pages
├── services/      # API service functions
├── hooks/         # Custom React hooks
├── utils/         # Helper utilities
└── assets/        # Images, icons, static files


Modules

Student


Dashboard
Courses
My Courses
Learning Content
Coding Practice
Progress Tracking
Live Quiz


Teacher


Dashboard
Course Management
Module Management
Quiz Management
Coding Questions
Student Tracking
Live Quiz Management



Getting Started

bash# 1. Clone the repository
git clone https://github.com/Aftab-sh/learning-platform-frontend.git
cd learning-platform-frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables

# .env.development
VITE_API_BASE_URL=http://localhost:8080

# .env.production
VITE_API_BASE_URL=https://your-backend-url.com

# 4. Start the development server
npm run dev
