"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors")); // Import cors
const auth_1 = __importDefault(require("./routes/auth")); // Import the auth routes
const user_1 = __importDefault(require("./routes/user")); // Import user routes
const quests_1 = __importDefault(require("./routes/quests")); // Import quest routes
const paths_1 = __importDefault(require("./routes/paths")); // Import paths routes
dotenv_1.default.config(); // Load environment variables from .env file
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;
const frontendUrl = process.env.FRONTEND_URL;
// --- Database Connection ---
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoUri) {
        console.error('Error: MONGO_URI is not defined in environment variables.');
        process.exit(1); // Exit if DB connection string is missing
    }
    try {
        yield mongoose_1.default.connect(mongoUri);
        console.log('MongoDB Connected...');
    }
    catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        // Exit process with failure
        process.exit(1);
    }
});
connectDB(); // Attempt to connect to the database on startup
// -------------------------
// --- Middleware ---
const allowedOrigins = [
    'https://solquest.io',
    'https://www.solquest.io',
    'https://solquestio-frontend.vercel.app',
    'https://solquestio.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://solquestio-git-main-solquest.vercel.app',
    'https://solquestio-solquest.vercel.app',
    'https://sol-quests.io',
    'https://www.sol-quests.io'
];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json()); // Middleware to parse JSON bodies
// ------------------
// --- Public API Routes ---
// Define a middleware that intercepts '/api/quests' GET requests before they hit the protected routes
app.get('/api/quests', (req, res) => {
    // Demo quests for public access
    const publicQuests = [
        {
            id: 'verify-wallet',
            title: 'Connect Your Wallet',
            shortDescription: 'Connect your Solana wallet to SolQuest',
            difficulty: 'beginner',
            xpReward: 100,
            path: 'solana-foundations',
            order: 1
        },
        {
            id: 'explore-transaction-1',
            title: 'Explore a Transaction',
            shortDescription: 'Learn how to read Solana transaction details',
            difficulty: 'beginner',
            xpReward: 150,
            path: 'solana-foundations',
            order: 2
        },
        {
            id: 'visit-x-og',
            title: 'Follow Us on X',
            shortDescription: 'Follow SolQuest on X (Twitter)',
            difficulty: 'beginner',
            xpReward: 100,
            path: 'solquest-og',
            order: 1
        }
    ];
    res.json(publicQuests);
});
// Define a public endpoint for /api/auth // Temporarily comment out
// app.get('/api/auth', (req: Request, res: Response) => { // Temporarily comment out
//   res.json({ // Temporarily comment out
//     message: 'Auth API is running', // Temporarily comment out
//     endpoints: { // Temporarily comment out
//       challenge: 'POST /api/auth/challenge - Get a challenge message to sign', // Temporarily comment out
//       verify: 'POST /api/auth/verify - Verify signature and get JWT token' // Temporarily comment out
//     } // Temporarily comment out
//   }); // Temporarily comment out
// }); // Temporarily comment out
// --- Protected API Routes ---
app.use('/api/auth', auth_1.default); // Mount the auth routes
app.use('/api/users', user_1.default); // Mount user routes 
app.use('/api/quests', quests_1.default); // Mount quest routes (handles /api/quests/paths as well)
app.use('/api/paths', paths_1.default); // Mount paths routes
// Basic route
app.get('/', (req, res) => {
    res.send('SolQuest.io Backend Running! (MongoDB)');
});
// TODO: Add authentication routes (e.g., /auth/verify)
// TODO: Add user profile routes (e.g., /users/me)
// TODO: Add quest routes (e.g., /quests)
// --- Conditional Listen for Local Development ---
// Only run app.listen if not in a Vercel environment
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Backend server listening locally on port ${port}`);
    });
}
// --- Export the app for Vercel ---
exports.default = app;
