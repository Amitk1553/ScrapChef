# ScrapChef 🍳

A full-stack recipe discovery and management platform that helps users find recipes based on available ingredients, save favorites, and manage a digital pantry.

**Live Demo:** [https://scrap-chef.vercel.app](https://scrap-chef.vercel.app)

## ✨ Key Features

- **Smart Recipe Discovery:** Find meals based on your current pantry items using Gemini AI.
- **Pantry Management:** Track and organize your available ingredients seamlessly.
- **Secure Authentication:** Complete user identity and session management via Clerk.
- **Digital Cookbook:** Bookmark favorite recipes and export printable PDF recipe cards.
- **Responsive UI:** Built with Tailwind CSS and Shadcn/ui for a flawless mobile and desktop experience.

## 🛠 Tech Stack

- **Frontend:** Next.js 15 (App Router), React 18, Tailwind CSS, Shadcn/ui
- **Backend:** Strapi (Headless CMS), Node.js, Express
- **Database:** PostgreSQL (Neon for Production), SQLite (Local Development)
- **External APIs:** Gemini AI, The Meal DB, Unsplash, Arcjet (Security)

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
git clone [https://github.com/yourusername/scrapchef.git](https://github.com/yourusername/scrapchef.git)
cd scrapchef

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

2. Environment Variables
You will need to set up your environment variables before running the application.

In the backend/ directory, create a .env file (use .env.example as a template) and add your database credentials and JWT secrets.

In the frontend/ directory, create a .env.local file and add your API keys:

Clerk Publishable & Secret Keys

Gemini AI API Key

Unsplash Access Key

Backend URL (http://localhost:1337 for local dev)

3. Run Locally
You will need two terminal windows to run both servers simultaneously.

Terminal 1: Start the Backend (Strapi)

Bash
cd backend
npm run develop
Backend API runs at http://localhost:1337
Admin Panel runs at http://localhost:1337/admin

Terminal 2: Start the Frontend (Next.js)

Bash
cd frontend
npm run dev
Frontend runs at http://localhost:3000

📄 License
This project is licensed under the MIT License.