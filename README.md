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