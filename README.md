# SolQuest.io

## Project Structure

- `frontend/`: Next.js frontend (deployed at https://solquest.io or https://solquestio-frontend.vercel.app)
- `backend/`: Vercel serverless API backend (deployed at https://solquestio.vercel.app)

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
   - **Value:** `https://solquestio.vercel.app`
2. Redeploy the frontend after setting the variable.

## Troubleshooting
- If the frontend cannot fetch quests or leaderboard, ensure `NEXT_PUBLIC_BACKEND_URL` is set to the correct backend deployment URL.
- The backend must be deployed and accessible at the URL specified by `NEXT_PUBLIC_BACKEND_URL`.

# The Graph Substreams on Solana Learning Path

This directory contains the implementation of a comprehensive learning path for The Graph's Substreams on Solana, designed to help developers prepare for The Graph Substreams hackathon track.

## Implemented Components

We've created a learning path with nine quest components:

1. **Fund Devnet Wallet** - Basic setup to ensure users have enough SOL for testing
2. **Introduction to Substreams** - Introduces The Graph Substreams technology and its benefits
3. **Environment Setup** - Guides users through setting up their development environment
4. **Your First Substreams** - Teaches how to create a basic Substreams for tracking SPL token transfers
5. **Data Transformation** - Explains how to transform and aggregate Solana data
6. **Deploying Substreams** - Shows how to package and deploy Substreams to substreams.dev
7. **AI Integration** - Placeholder for future content on combining Substreams with AI
8. **Analytics Dashboard** - Placeholder for future content on building analytical interfaces
9. **Wormhole Integration** - Placeholder for future content on tracking cross-chain activity

## Current Status

- The learning path structure is implemented in `frontend/app/paths/substreams/page.tsx`
- Basic quest components are implemented with interactive elements and knowledge checks
- Some components (AI Integration, Analytics Dashboard, Wormhole Integration) are placeholders for future development
- A few components have syntax issues that need to be fixed (SubstreamsBasicQuest, SubstreamsTransformQuest)

## Next Steps

1. **Fix syntax issues** in the SubstreamsBasicQuest and SubstreamsTransformQuest components
2. **Complete the placeholder content** for AI Integration, Analytics Dashboard, and Wormhole Integration
3. **Add more detailed code examples** to each quest, focused on practical implementation
4. **Include demo projects** that can be used as starting points for hackathon submissions
5. **Add more specific hackathon preparation content** related to The Graph's judging criteria

## Hackathon Focus Points

For developers using this learning path to prepare for the hackathon, we recommend focusing on:

- Building innovative indexing solutions that solve real problems for Solana developers
- Exploring integrations with other protocols like Wormhole for cross-chain data
- Creating useful data transformations that surface insights not easily available otherwise
- Developing user interfaces that make the indexed data accessible and useful

## Resources

- [Substreams Documentation](https://docs.substreams.dev/)
- [The Graph Substreams Documentation](https://thegraph.com/docs/en/substreams/)
- [The Graph Now Supports Solana with Substreams](https://thegraph.com/blog/indexing-solana-substreams/)
- [Substreams Registry](https://substreams.dev/)