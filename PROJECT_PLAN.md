# SolQuestio - Quest-based Learning Platform for Solana

## Project Overview
SolQuestio is a quest-based learning platform focused on the Solana ecosystem, designed to help users learn about Solana blockchain technology through interactive quests and challenges.

## Project Structure
```
solquestio/
├── frontend/           # Next.js frontend application
├── backend/            # Node.js/Express API server
└── database/           # Database migrations and schema
```

## Technology Stack
- **Frontend**: Next.js, TypeScript, TailwindCSS, React
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Blockchain**: Solana Web3.js
- **Authentication**: JWT, potentially with wallet authentication
- **Deployment**: Docker, potentially Vercel for frontend

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
   - Refferals

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

## Getting Started
Instructions for setting up the development environment will be added here. 