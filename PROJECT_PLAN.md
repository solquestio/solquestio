# SolQuestio - Quest-based Learning Platform for Solana

## Project Overview
SolQuestio is a quest-based learning platform focused on the Solana ecosystem, designed to help users learn about Solana blockchain technology through interactive quests and challenges.

## Project Structure
```
solquestio/
├── frontend/           # Next.js frontend application (deployed at https://solquest.io or https://solquestio-frontend.vercel.app)
├── backend/            # Vercel serverless API backend (deployed at https://solquestio.vercel.app)
└── database/           # Database migrations and schema
```

## Technology Stack
- **Frontend**: Next.js, TypeScript, TailwindCSS, React
- **Backend**: Vercel Serverless Functions (TypeScript)
- **Database**: PostgreSQL
- **Blockchain**: Solana Web3.js
- **Authentication**: JWT, wallet authentication
- **Deployment**: Vercel (frontend and backend as separate projects)

## Key Features
1. **User Authentication**
   - Solana wallet connection in prod
   - User profiles

2. **Quest System**
   - Structured learning paths
   - Interactive code challenges/quests
   - Quest progression tracking
   - Quests with onchain and offchain interactions
   - Achievements and badges

3. **Solana Integration**
   - On-chain verification of quest completion
   - Token rewards for completing quests (XP for completing + at some stage we might have tokens)
   - NFT badges for achievements

4. **Community Features**
   - User rankings
   - Referrals

## Development Phases
1. **Phase 1: Core Infrastructure**
   - Project setup (frontend, backend, database)
   - Basic authentication with wallet
   - Database schema design

2. **Phase 2: Quest System**
   - Quest creation interface
   - Quest completion tracking
   - Basic progress metrics

3. **Phase 3: Solana Integration**
   - Wallet connections
   - On-chain verification
   - Token + XP + NFT rewards

4. **Phase 4: Community & Social**
   - User profiles
   - Leaderboards

## Connecting Frontend and Backend

The frontend communicates with the backend via the `NEXT_PUBLIC_BACKEND_URL` environment variable.

### Local Development
1. Create a `.env` file in the `frontend/` directory:
   ```
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   ```
   (or your local backend URL)

### Production Deployment
1. In the Vercel dashboard for the frontend project, set:
   - **Key:** `NEXT_PUBLIC_BACKEND_URL`
   - **Value:** `https://api.solquest.io`
2. Redeploy the frontend after setting the variable.

## Troubleshooting
- If the frontend cannot fetch quests or leaderboard, ensure `NEXT_PUBLIC_BACKEND_URL` is set to the correct backend deployment URL.
- The backend must be deployed and accessible at the URL specified by `NEXT_PUBLIC_BACKEND_URL`.

## Getting Started
Instructions for setting up the development environment will be added here. 