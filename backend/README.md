# SolQuestio Backend

SolQuestio is a quest-based learning platform for the Solana ecosystem. This is the backend API built with Node.js, Express, and MongoDB, designed for deployment on Vercel.

## 📋 Project Structure

```
/backend
├── api/                  # Serverless functions for Vercel deployment
│   ├── auth/             # Authentication endpoints
│   ├── quests/           # Quest-related endpoints
│   ├── users/            # User-related endpoints
│   ├── health.ts         # Health check endpoint
│   ├── index.ts          # Root API endpoint
│   ├── minimal.ts        # Minimal test endpoint
│   └── ping.ts           # Simple ping endpoint
├── lib/                  # Shared libraries and utilities
│   ├── config.ts         # Configuration from environment variables
│   ├── database.ts       # Database connection utilities
│   ├── middleware/       # Shared middleware functions
│   ├── models/           # Mongoose models
│   └── utils/            # Helper functions
├── .env                  # Environment variables (not in git)
├── .env.example          # Example environment variables
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── vercel.json           # Vercel deployment configuration
```

## 🚀 Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your values
4. Run the development server:
   ```
   npm run dev
   ```

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGO_URI | MongoDB connection string | - |
| JWT_SECRET | Secret for signing JWTs | default_secret |
| FRONTEND_URL | URL of frontend for CORS | http://localhost:3000 |
| HELIUS_API_KEY | Helius API key for Solana | - |
| HELIUS_RPC_URL | Helius RPC URL | - |
| PORT | Port for local development | 5000 |

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/challenge` - Get a challenge message to sign
- `POST /api/auth/verify` - Verify signature and get JWT token

### Users
- `GET /api/users/me` - Get current user profile
- `GET /api/users/leaderboard` - Get user leaderboard

### Quests
- `GET /api/quests` - List all quests
- `GET /api/quests/[id]` - Get a specific quest
- `GET /api/quests/paths` - Get quest paths
- `POST /api/quests/complete` - Complete a quest (requires auth)

## 📝 Deployment to Vercel

### Vercel Setup

1. Create a new project on Vercel and link it to your GitHub repository
2. Set the following settings:
   - Framework Preset: Other
   - Root Directory: `backend`
   - Build Command: None (not required for serverless functions)
   - Install Command: `npm install`

### Environment Variables

Add all required environment variables to your Vercel project settings:

1. Go to your project on Vercel
2. Go to Settings > Environment Variables
3. Add all variables from the `.env.example` file with your actual values

### Deploy

We've added a helpful deployment script to streamline the process. Run:

```bash
node deploy.js
```

Alternatively, you can deploy manually with the Vercel CLI:

```bash
# Login to Vercel if not already logged in
vercel login

# Deploy to preview environment
vercel

# Deploy to production
vercel --prod
```

### Verifying the Deployment

After deployment, test the following public endpoints to verify your API is working correctly:

1. `<your-vercel-url>/api/public` - Should return API information
2. `<your-vercel-url>/api/quests` - Should return public quests data
3. `<your-vercel-url>/api/auth` - Should return auth endpoint information

### Troubleshooting

If you encounter any issues with your deployment:

1. **CORS Errors**: Ensure `FRONTEND_URL` environment variable is set correctly
2. **Authentication Issues**: Check that `JWT_SECRET` is properly configured
3. **Database Connection**: Verify your `MONGO_URI` is accessible from Vercel's servers
4. **Function Timeouts**: Serverless functions have a 10-second timeout by default

After deploying, test your API with:

```
curl https://your-deployment-url.vercel.app/api/health
```

You should see a JSON response with health information.

## 🪲 Troubleshooting

Common issues:

1. **Connection errors to MongoDB**:
   - Check your MONGO_URI in environment variables
   - Ensure your IP is whitelisted in MongoDB Atlas

2. **JWT errors**:
   - Make sure JWT_SECRET is properly set
   - Check token expiration and validity

3. **CORS errors**:
   - Verify FRONTEND_URL is correctly set
   - CORS is configured to allow requests from your frontend
