# SolQuestio Frontend

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Building for Production

When building for production, follow these steps to avoid module resolution issues:

1. Clean the Next.js cache first:
   ```bash
   rm -r -Force .next    # PowerShell
   # OR
   rm -rf .next          # Bash
   ```

2. Reinstall dependencies if you encounter module resolution errors:
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Start the production server:
   ```bash
   npm run start
   ```

## Troubleshooting

### Module Resolution Errors

If you encounter errors like `Cannot find module './XXX.js'`, try these steps:

1. Clean the Next.js cache (see above)
2. Delete the node_modules folder and reinstall dependencies:
   ```bash
   rm -r -Force node_modules   # PowerShell
   # OR
   rm -rf node_modules         # Bash
   
   npm install
   ```

3. Ensure you have proper Vercel configuration in `vercel.json`

### Environment Configuration

Make sure you have the correct environment variables set:

- For development: use `.env.local` or `.env`
- For production: use `.env.production`

Required variables:
- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_HELIUS_RPC_URL` 