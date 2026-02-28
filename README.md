# ScrapChef

A full-stack recipe discovery and management platform that helps users find recipes based on available ingredients, save favorites, and manage a digital pantry.

## Features

- 🔍 **Smart Recipe Discovery** - Find recipes based on ingredients you have
- 🥘 **Pantry Management** - Track and organize your available ingredients
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🔐 **Secure Authentication** - User accounts with Clerk integration
- 📥 **Recipe Bookmarking** - Save your favorite recipes for quick access
- 📄 **PDF Export** - Generate printable recipe cards
- ⭐ **Premium Features** - Extended functionality for Pro subscribers

## Tech Stack

### Frontend

- **Next.js 15+** - React framework with App Router
- **React 18+** - UI library
- **Tailwind CSS** - Utility-first styling framework
- **Shadcn/ui** - High-quality reusable React components built on Radix UI
- **Clerk** - User authentication and session management
- **@react-pdf/renderer** - PDF generation for recipe export
- **Sonner** - Toast notifications
- **Arcjet** - Security, rate limiting, and bot detection
- **react-dropzone** - File upload handling
- **react-spinners** - Loading spinner components

### Backend

- **Strapi** - Headless CMS and API platform
- **Node.js & Express** - Runtime and web framework
- **Knex.js** - Query builder (via Strapi)

### Database

- **PostgreSQL** (via Neon) - Production database (recommended)
- **SQLite** - Development database (default)
- **Neon** - Serverless PostgreSQL platform for cloud hosting

### External APIs & Services

- **The Meal DB API** - Free recipe data and ingredients
- **Gemini AI API** - AI-powered features (recipe suggestions, analysis)
- **Unsplash API** - High-quality recipe and ingredient images
- **Clerk** - OAuth and identity management

### DevOps & Tools

- **npm** - Package manager
- **Git** - Version control
- **Turbopack** - Next.js development server
- **Vercel** - Frontend deployment
- **Strapi Cloud** - Backend deployment

### Design & Documentation

- **Eraser** - Data flow and architecture diagrams

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** v9.0.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** (optional, for production; SQLite is default for development)

### Required Accounts & API Keys

Create accounts and obtain API keys for the following services:

1. **Clerk** ([Sign up](https://clerk.com/)) - User authentication
   - Create an application and generate publishable & secret keys
   - Configure OAuth providers (Google, GitHub, etc.)

2. **Neon** ([Sign up](https://neon.tech/)) - PostgreSQL database (optional, for production)
   - Create a project and get your database connection URL
   - Free tier available with generous limits

3. **The Meal DB API** ([Documentation](https://www.themealdb.com/api.php)) - Free recipe data
   - No API key required (free tier available)
   - Optional: Get API key for higher rate limits

4. **Gemini AI API** ([Get API Key](https://aistudio.google.com/api-keys)) - AI features
   - Free tier available with usage limits
   - Get your API key from Google AI Studio

5. **Unsplash API** ([Sign up](https://unsplash.com/oauth/applications)) - Recipe images
   - Free tier: 50 requests per hour
   - Get your Access Key from Unsplash Developers

6. **Arcjet** ([Sign up](https://arcjet.com/)) - Security features (optional)
   - Free tier available
   - Get your API key from Arcjet dashboard

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/scrapchef.git
cd scrapchef
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Environment Variables

### Backend (.env)

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# Or for PostgreSQL (Neon):
# DATABASE_CLIENT=postgres
# DATABASE_HOST=your-neon-host.neon.tech
# DATABASE_PORT=5432
# DATABASE_NAME=neondb
# DATABASE_USERNAME=your_username
# DATABASE_PASSWORD=your_password
# DATABASE_URL=postgresql://your_username:your_password@your-neon-host.neon.tech:5432/neondb?sslmode=require

# Admin Configuration
ADMIN_JWT_SECRET=your_admin_jwt_secret_key_here
JWT_SECRET=your_jwt_secret_key_here
API_TOKEN_SALT=your_api_token_salt_here

# Server Configuration
HOST=0.0.0.0
PORT=1337
NODE_ENV=development

# CORS Configuration (for Frontend)
CORS_ORIGIN=http://localhost:3000

# External APIs
GEMINI_API_KEY=your_gemini_api_key
MEAL_DB_API_KEY=your_meal_db_api_key (optional)
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

**Note:** Use `.env.example` as a template. Generate secure secrets using tools like `openssl rand -base64 32`.

### Frontend (.env.local)

Create a `.env.local` file in the `frontend/` directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:1337
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# External API Keys
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
NEXT_PUBLIC_MEAL_DB_API_KEY=your_meal_db_api_key (optional)

# Arcjet Security (Optional)
NEXT_PUBLIC_ARCJET_KEY=your_arcjet_key

# Environment
NODE_ENV=development
```

**Note:** Keys prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put sensitive secrets here. Get API keys from their respective dashboards.

## Running the Project

### Development Mode

#### Terminal 1: Start the Backend (Strapi)

```bash
cd backend
npm run develop
```

The backend will be available at `http://localhost:1337`

Strapi Admin Panel: `http://localhost:1337/admin`

#### Terminal 2: Start the Frontend (Next.js)

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Production Build

#### Backend

```bash
cd backend
npm run build
npm run start
```

#### Frontend

```bash
cd frontend
npm run build
npm run start
```

## Project Structure

```
ScrapChef/
├── backend/                          # Strapi CMS & API
│   ├── config/                       # Server configuration
│   │   ├── database.js              # Database setup
│   │   ├── server.js                # Server config
│   │   ├── middlewares.js           # CORS, logging, etc.
│   │   └── plugins.js               # Third-party plugins
│   ├── src/
│   │   ├── api/                     # Content types & routes
│   │   │   ├── recipe/              # Recipe API
│   │   │   ├── pantry-item/         # Pantry items API
│   │   │   └── saved-recipe/        # Saved recipes API
│   │   ├── extensions/              # User auth extensions
│   │   └── index.js                 # Entry point
│   ├── database/                    # Database migrations
│   ├── public/                      # Static files
│   ├── types/                       # TypeScript definitions
│   ├── .env                         # Environment variables
│   └── package.json
│
├── frontend/                         # Next.js Application
│   ├── app/                         # Next.js pages & layouts
│   │   ├── (auth)/                  # Authentication routes
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── (main)/                  # Protected routes
│   │   │   ├── dashboard/
│   │   │   ├── pantry/
│   │   │   ├── recipe/
│   │   │   └── recipes/
│   │   ├── layout.js                # Root layout
│   │   ├── page.jsx                 # Home page
│   │   └── globals.css
│   ├── components/                  # Reusable React components
│   │   ├── RecipeCard.jsx
│   │   ├── RecipeGrid.jsx
│   │   ├── RecipePDF.jsx
│   │   ├── AddToPantryModal.jsx
│   │   ├── ui/                      # Shadcn/ui components
│   │   └── ...
│   ├── actions/                     # Server actions
│   │   ├── recipe.actions.js
│   │   ├── pantry.actions.js
│   │   └── mealdb.actions.js
│   ├── hooks/                       # Custom React hooks
│   │   └── use-fetch.js
│   ├── lib/                         # Utilities
│   │   ├── arcjet.js               # Security config
│   │   ├── checkUser.js            # User utilities
│   │   ├── utils.js                # Helper functions
│   │   └── data.js
│   ├── public/                      # Static assets
│   ├── .env.local                   # Environment variables
│   ├── next.config.mjs              # Next.js config
│   └── package.json
│
└── README.md
```

## System Architecture & Data Flow

ScrapChef follows a three-tier architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Next.js)                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ React Components (RecipeCard, RecipeGrid, Modals)    │  │
│  │ Server Actions (recipe.actions.js, pantry.actions)   │  │
│  │ Clerk Authentication UI                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    HTTP/REST API (JSON)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   API LAYER (Strapi Backend)                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Controllers (handle incoming requests)               │  │
│  │ Services (business logic)                            │  │
│  │ Routes (REST endpoints)                              │  │
│  │ Content Types Schemas                                │  │
│  │ Authentication & Authorization                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    Database Operations
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              DATABASE LAYER (PostgreSQL/SQLite)             │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │    Recipes     │  │  Pantry Items  │  │ Saved Recipes│ │
│  │                │  │                │  │              │ │
│  │ • title        │  │ • name         │  │ • user_id    │ │
│  │ • description  │  │ • quantity     │  │ • recipe_id  │ │
│  │ • ingredients  │  │ • owner (userId)│  │ • savedAt    │ │
│  │ • instructions │  │ • imageUri     │  │              │ │
│  │ • cuisine      │  │ • other fields │  │              │ │
│  │ • author       │  │                │  │              │ │
│  │ • imageUrl     │  └────────────────┘  └──────────────┘ │
│  │ • etc.         │   ▲                                     │
│  └────────────────┘   │                                     │
│        ▲              └─ Related to User & Recipe           │
│        └──────────────────────────────────────────────────  │
│                    User (Clerk + Strapi)                    │
│         (firstName, lastName, email, imageUri, etc.)        │
│                                                              │
└─────────────────────────────────────────────────────────────┘

## Data Flow Example: Finding Recipes by Ingredients

1. **User Interaction** → User navigates to /recipes/pantry in Next.js browser
2. **Client → Server** → Next.js server action calls `recipe.actions.js`
3. **Frontend → Backend** → Recipe action makes HTTP GET to `/api/recipes`
4. **Backend Processing** → Strapi controller queries database for all recipes
5. **Database Query** → PostgreSQL returns recipe records
6. **Response** → Strapi sends JSON array of recipes back to client
7. **Component Rendering** → `RecipeGrid.jsx` renders `RecipeCard.jsx` components
8. **User Sees** → Filtered recipe list matching pantry ingredients

## External API Integrations

### The Meal DB API
- **Purpose**: Provides free recipe database for seeding and supplementary recipe data
- **Usage**: Fetch recipes, ingredients, meal categories, and cuisines
- **Integration**: Called from backend or `mealdb.actions.js` server action

### Gemini AI API
- **Purpose**: AI-powered recipe suggestions, ingredient analysis, and meal planning
- **Usage**: Generate recipe recommendations based on available ingredients
- **Integration**: Called from backend services or server actions

### Unsplash API
- **Purpose**: High-quality recipe and ingredient images
- **Usage**: Fetch professional images for recipes
- **Integration**: Called from `ImageUploader.jsx` or backend services

### Clerk Authentication
- **Purpose**: User account management, OAuth, and session management
- **Usage**: Sign up, sign in, user profile management
- **Integration**: Clerk React components in auth routes, middleware validation

## Database Schema

### Recipe Content Type
```

id (Primary Key)
title (String)
description (Text)
cuisine (Enum: indian, italian, chinese, american, other)
category (Enum: live, non-veg, vegan, dessert, snack)
ingredients (JSON Array)
instructions (JSON Array)
imageUrl (String)
isPublic (Boolean, default: true)
prepTime (Integer - seconds)
cookTime (Integer - seconds)
servings (Integer)
nutrition (JSON Object)
hints (JSON Array)
substitutions (JSON Array)
author (String)
timestamps (createdAt, updatedAt)

```

### Pantry Item Content Type
```

id (Primary Key)
name (String)
owner (Relation to User)
quantity (String)
imageUri (String)
timestamps (createdAt, updatedAt)

```

### Saved Recipe Content Type
```

id (Primary Key)
recipe (Relation to Recipe)
savedAt (DateTime)
user (Relation to User)
timestamps (createdAt, updatedAt)

```

### User Content Type (Strapi)
```

id (Primary Key)
clerkId (String, unique)
email (String, unique)
firstName (String)
lastName (String)
imageUri (String)
subscriptionTier (Enum: free, pro)
timestamps (createdAt, updatedAt)

````

## API Endpoints (Strapi)

### Recipes

- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:id` - Get recipe by ID
- `POST /api/recipes` - Create recipe (authenticated)
- `PUT /api/recipes/:id` - Update recipe (authenticated)
- `DELETE /api/recipes/:id` - Delete recipe (authenticated)

### Pantry Items

- `GET /api/pantry-items` - Get user's pantry
- `POST /api/pantry-items` - Add item to pantry
- `DELETE /api/pantry-items/:id` - Remove from pantry

### Saved Recipes

- `GET /api/saved-recipes` - Get saved recipes
- `POST /api/saved-recipes` - Save a recipe
- `DELETE /api/saved-recipes/:id` - Remove saved recipe

## Troubleshooting

### Port Already in Use

If port 1337 (backend) or 3000 (frontend) is already in use:

**Backend:**

```bash
cd backend
PORT=3001 npm run develop
````

**Frontend:**

```bash
cd frontend
PORT=3001 npm run dev
```

### Database Connection Issues

#### For SQLite (Development)

- Ensure the `.tmp/` directory exists in the backend folder
- Check file permissions on the database file

#### For PostgreSQL/Neon (Production)

Ensure PostgreSQL is running and your connection URL is correct:

```bash
# Test Neon connection
NEXT_PUBLIC_DATABASE_URL=postgresql://user:password@host:5432/db psql

# Or test from Node.js
node -e "const connectionString = process.env.DATABASE_URL; console.log(connectionString);"
```

**Common issues:**

- Wrong host/port in connection string
- Database user doesn't exist
- SSL mode not set to `require` for Neon
- Network firewall blocking connection

### Clerk Authentication Not Working

1. Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is correctly set
2. Check that your Clerk application allows `http://localhost:3000` as a redirect URI
3. Ensure `CLERK_SECRET_KEY` is set in backend variables
4. Clear browser cookies and cache, then refresh
5. Check Clerk dashboard for any errors or blocked users

### External API Errors

**Gemini API:**

- Verify API key is valid and enabled
- Check your Google Cloud project quota
- Ensure API is enabled in Google Cloud Console

**Unsplash API:**

- Verify Access Key is correct
- Check rate limits (50 requests/hour for free tier)
- Ensure correct API endpoint format

**The Meal DB API:**

- Most endpoints don't require authentication
- Check if service is operational at https://www.themealdb.com/

### Deployment Issues

See [Deployment Documentation](#deployment) section for platform-specific troubleshooting.

## Deployment

### Frontend Deployment (Vercel)

**Live URL:** [https://scrap-chef.vercel.app](https://scrap-chef.vercel.app)

#### Steps to Deploy:

1. Push your code to GitHub
2. Connect repository to Vercel at [https://vercel.com](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_API_URL` (point to deployed backend)
   - `NEXT_PUBLIC_GEMINI_API_KEY`
   - `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY`
   - `NEXT_PUBLIC_ARCJET_KEY`
4. Deploy button triggers automatic build and deployment

**Vercel Dashboard:** [https://vercel.com/amitk1553s-projects/scrap-chef](https://vercel.com/amitk1553s-projects/scrap-chef)

### Backend Deployment (Strapi Cloud)

**Live URL:** Available via Strapi Cloud dashboard

#### Steps to Deploy:

1. Ensure `.strapirc.json` and `.strapi-cloud.json` are configured
2. Authenticate with Strapi Cloud: `strapi cloud login`
3. Deploy: `strapi deploy`
4. Configure environment variables in Strapi Cloud dashboard:
   - Database credentials (PostgreSQL via Neon)
   - JWT secrets
   - External API keys (Gemini, Unsplash, etc.)
   - CORS origin (your deployed frontend URL)

**Strapi Dashboard:** [https://cloud.strapi.io/projects/scrapchef-e36f71951c/production/deployments](https://cloud.strapi.io/projects/scrapchef-e36f71951c/production/deployments)

#### Database Setup (Neon):

1. Create PostgreSQL instance on [Neon](https://neon.tech/)
2. Copy connection string
3. Set `DATABASE_URL` in Strapi Cloud environment variables
4. Run migrations: `npm run migrate`

**Neon Project:** [https://console.neon.tech/](https://console.neon.tech/)

### Production Checklist

- [ ] All environment variables configured on both platforms
- [ ] CORS origin updated to production domain
- [ ] Database backups enabled
- [ ] SSL/TLS certificates verified
- [ ] Rate limiting configured (Arcjet)
- [ ] Error monitoring set up (optional: Sentry)
- [ ] CDN enabled for static assets
- [ ] Clerk production keys configured
- [ ] API keys rotated and secured
- [ ] Performance monitoring active

Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Key Dependencies

### Frontend

```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@clerk/nextjs": "^5.x.x",
  "@react-pdf/renderer": "^3.x.x",
  "tailwindcss": "^3.x.x",
  "sonner": "^1.x.x",
  "react-dropzone": "^14.x.x",
  "react-spinners": "^0.14.x.x",
  "@radix-ui/react-dialog": "^1.x.x"
}
```

### Backend

```json
{
  "strapi": "^5.x.x",
  "@strapi/plugin-users-permissions": "^5.x.x",
  "@strapi/plugin-cloud": "^5.x.x"
}
```

For complete dependency lists, see `package.json` in frontend and backend directories.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Workflow

### Local Development

1. Open two terminal windows/tabs
2. In terminal 1, navigate to `backend/` and run `npm run develop`
3. In terminal 2, navigate to `frontend/` and run `npm run dev`
4. Visit `http://localhost:3000` in your browser
5. Use `http://localhost:1337/admin` to manage backend content

### Debug Mode

#### Backend Debug

```bash
cd backend
DEBUG=strapi* npm run develop
```

#### Frontend Debug

```bash
cd frontend
NODE_OPTIONS='--inspect' npm run dev
# Visit chrome://inspect to see the debugger
```

### Testing (If Available)

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Useful Resources & Documentation

### Core Technologies

- [Next.js Documentation](https://nextjs.org/docs) - Framework guide and API reference
- [React Documentation](https://react.dev) - React fundamentals and hooks
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling framework
- [Shadcn/ui Components](https://ui.shadcn.com/) - Pre-built component library
- [Strapi Documentation](https://docs.strapi.io/) - Headless CMS guide

### Authentication & Security

- [Clerk Documentation](https://clerk.com/docs) - User authentication
- [Clerk Customization Guide](https://clerk.com/docs/nextjs/guides/customizing-clerk/appearance-prop/themes)
- [Clerk Billing Integration](https://clerk.com/docs/nextjs/guides/billing/for-b2c)
- [Arcjet Security](https://arcjet.com/docs) - Rate limiting and bot detection

### Database

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Neon PostgreSQL Hosting](https://neon.tech/docs) - Serverless PostgreSQL
- [Knex.js Query Builder](https://knexjs.org/) - SQL query builder

### External APIs

- [The Meal DB API](https://www.themealdb.com/api.php) - Recipe data (free)
- [Google Gemini AI API](https://ai.google.dev/docs) - AI features
- [Unsplash API](https://unsplash.com/developers) - Images (free)

### Libraries

- [@react-pdf/renderer](https://react-pdf.org/) - PDF generation
- [react-dropzone](https://react-dropzone.js.org/) - File uploads
- [react-spinners](https://www.npmjs.com/package/react-spinners) - Loading spinners
- [Sonner](https://sonner.emilkowal.ski/) - Toast notifications

### Deployment & DevOps

- [Vercel Deployment](https://vercel.com/docs) - Frontend hosting
- [Strapi Cloud Deployment](https://docs.strapi.io/cloud) - Backend hosting

### Design & Architecture

- [Data Flow Diagram](https://app.eraser.io/workspace/s8SW2krVNVDh8BZsJ5mi) - System architecture visualization

## Support

For issues or questions:

- 📝 Open an issue on GitHub
- 💬 Create a discussion for questions
- 📧 Contact: [your-email@example.com]
- 📚 Documentation: [link to wiki or docs site]

## Roadmap

- [ ] AI-powered recipe recommendations
- [ ] Nutritional information display & tracking
- [ ] Shopping list generation & export
- [ ] Social sharing features
- [ ] Mobile app (React Native)
- [ ] Meal planning calendar
- [ ] Grocery store price integration
- [ ] Dietary restriction filters
- [ ] Recipe rating & review system
- [ ] Dark mode theme
- [ ] Multi-language support
- [ ] Video recipe tutorials
- [ ] Barcode scanner for ingredients
