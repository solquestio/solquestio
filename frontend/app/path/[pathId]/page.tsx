'use client';

import { useEffect, useState, useCallback } from 'react';
// Remove usePathname if not needed, params are passed directly
// import { usePathname } from 'next/navigation'; 

// TODO: Import Quest interface and other necessary hooks/components later

// Example Quest interface (can be imported from profile page or a shared types file later)
interface Quest {
    id: string;
    title: string;
    description: string;
    path: string;
    order: number;
    isCompleted: boolean;
    xpReward: number;
}

interface UserProfile { // Needed for updating state after quest completion
  id: string;
  walletAddress: string;
  username?: string;
  completedQuestIds: string[];
  xp: number;
  lastCheckedInAt?: string | Date;
  checkInStreak?: number;
  createdAt: string;
  updatedAt: string;
  ownsOgNft?: boolean;
  telegram?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  };
}

// Constants
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const AUTH_TOKEN_KEY = 'solquest_auth_token';
const FUND_WALLET_QUEST_ID = 'fund-wallet';
const EXPLORE_TRANSACTION_QUEST_ID = 'explore-transaction-1'; // Add quest ID constant

// Page component receives params object containing route parameters
export default function PathDetailPage({ params }: { params: { pathId: string } }) {
    const { pathId } = params;
    const [quests, setQuests] = useState<Quest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pathTitle, setPathTitle] = useState<string>(''); // To display path title
    // Add state for auth token and quest verification
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [isVerifyingQuest, setIsVerifyingQuest] = useState<string | null>(null);
    // Add user profile state to update on quest completion
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // State for quest inputs
    const [transactionQuestAnswer, setTransactionQuestAnswer] = useState('');
    const [questInputError, setQuestInputError] = useState<Record<string, string | null>>({}); // Store errors per quest ID

    // Get auth token on mount
    useEffect(() => {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        if (storedToken) {
            setAuthToken(storedToken);
        } else {
            setError('Authentication required to view quests.'); // Handle no token case
            setIsLoading(false);
        }
        // Fetch user profile initially if needed, or rely on quest verification responses
        // Could potentially fetch profile here to get initial completed state without waiting for quest verification
    }, []);

    // Fetch quests for the specific pathId from backend when token is available
    const fetchPathQuests = useCallback(async (token: string) => {
        if (!token) return;
        console.log(`Fetching quests for path: ${pathId} with token`);
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${BACKEND_URL}/quests/path/${pathId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch quests');
            }
            const data: Quest[] = await response.json();
            setQuests(data);

            // Set path title from the first quest (assuming all quests in response belong to the same path)
            if (data.length > 0) {
                // Simple title generation (can be improved if backend sends path metadata)
                setPathTitle(data[0].path.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
            } else {
                 setPathTitle(pathId); // Fallback title
            }

        } catch (err: any) {
            console.error('Error fetching path quests:', err);
            setError(err.message || 'Could not load quests for this path.');
            setQuests([]); // Clear quests on error
        } finally {
            setIsLoading(false);
        }
    }, [pathId]); // Depends only on pathId

    useEffect(() => {
        if (authToken) {
            fetchPathQuests(authToken);
        }
    }, [authToken, fetchPathQuests]);

    // --- Quest Action Handlers --- 

    // Function to verify balance for Quest 2 (Adapted from ProfilePage)
    const verifyBalanceQuest = useCallback(async () => {
        if (!authToken) {
            setError('Authentication token not found. Please try logging in again.');
            return;
        }
        console.log(`Attempting to verify quest: ${FUND_WALLET_QUEST_ID}`);
        setIsVerifyingQuest(FUND_WALLET_QUEST_ID);
        setError(null); 
        setQuestInputError(prev => ({...prev, [FUND_WALLET_QUEST_ID]: null}));

        try {
            const response = await fetch(`${BACKEND_URL}/quests/check-balance`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
            });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message || 'Failed to verify balance quest'); }

            console.log('Balance quest verification response:', data);
            // Update user profile state and refetch quests to update list
            if (data.user) {
                setUserProfile(data.user); // Store updated profile
                fetchPathQuests(authToken); // Refetch quests for this path
            }

        } catch (err: any) {
            console.error('Error verifying balance quest:', err);
            setError(`Quest Verification Error: ${err.message}`); // Show error on this page
        } finally {
            setIsVerifyingQuest(null); // Clear verifying state
        }
    }, [authToken, fetchPathQuests]); // Depends on token and refetch function

    // --- Handler for Transaction Quest --- 
    const handleVerifyTransaction = useCallback(async () => {
        if (!authToken) {
            setError('Authentication token not found. Please try logging in again.');
            return;
        }
        if (!transactionQuestAnswer) {
            setQuestInputError(prev => ({...prev, [EXPLORE_TRANSACTION_QUEST_ID]: 'Answer cannot be empty.'}));
            return;
        }

        const questId = EXPLORE_TRANSACTION_QUEST_ID;
        console.log(`Attempting to verify quest: ${questId} with answer: ${transactionQuestAnswer}`);
        setIsVerifyingQuest(questId);
        setError(null); 
        setQuestInputError(prev => ({...prev, [questId]: null})); // Clear previous input error

        try {
            const response = await fetch(`${BACKEND_URL}/quests/verify-transaction`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ questId, answer: transactionQuestAnswer })
            });
            const data = await response.json();
            
            if (!response.ok) { 
                 // If backend validation fails (e.g., wrong answer), show message
                setQuestInputError(prev => ({...prev, [questId]: data.message || 'Verification failed'}));
                // Don't throw here, let user try again
                console.warn('Quest verification failed (server): ', data.message);
                return; // Stop execution for non-OK responses handled as input errors
                // For other errors (500), we might want to throw or set general error
                // throw new Error(data.message || 'Failed to verify transaction quest'); 
            }

            console.log('Transaction quest verification response:', data);
            if (data.user) {
                setUserProfile(data.user); // Update profile state
                fetchPathQuests(authToken); // Refetch quests for this path
                setTransactionQuestAnswer(''); // Clear input on success
            }

        } catch (err: any) {
            console.error('Error verifying transaction quest:', err);
            setError(`Quest Verification Network/Server Error: ${err.message}`); // Set general error for network/unexpected issues
        } finally {
            // Clear verifying state only if it was for THIS quest
            // (avoids race conditions if multiple quests could verify simultaneously)
            if (isVerifyingQuest === questId) {
                setIsVerifyingQuest(null); 
            }
        }
    }, [authToken, fetchPathQuests, transactionQuestAnswer, isVerifyingQuest]); // Added isVerifyingQuest dependency

    // --- Render Logic --- 
    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">
                Learning Path: {pathTitle || pathId}
            </h1>
            <p className="text-gray-400 mb-8">Complete the quests below to learn and earn XP!</p>

            {isLoading && <p className="text-center text-gray-400">Loading quests...</p>}
            {/* Display general errors */}
            {error && !isLoading && <p className="text-red-500 text-center mb-4">Error: {error}</p>}

            {!isLoading && !error && quests.length === 0 && (
                 <p className="text-gray-500 text-center">No quests found for this path, or you are not authenticated.</p>
            )}

            {!isLoading && !error && quests.length > 0 && (
                <div className="space-y-6">
                    {quests.sort((a, b) => a.order - b.order).map((quest) => (
                        <div key={quest.id} className={`p-4 rounded-lg border ${quest.isCompleted ? 'border-green-500/50 bg-green-900/20' : 'border-gray-600 bg-gray-800/30'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className={`font-semibold text-lg ${quest.isCompleted ? 'text-green-400' : 'text-gray-100'}`}>{quest.title}</h4>
                                <span className={`text-sm font-medium ${quest.isCompleted ? 'text-green-600' : 'text-yellow-400'}`}>
                                    {quest.isCompleted ? 'COMPLETED' : `+${quest.xpReward} XP`}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-3">{quest.description}</p>
                            
                            {/* --- Quest Actions/Inputs --- */}
                            {!quest.isCompleted && (
                                <div className="mt-3">
                                    {quest.id === 'verify-wallet' && (
                                        <p className="text-xs text-blue-400">(Complete by signing in via the main Verify Wallet button)</p>
                                    )}

                                    {quest.id === FUND_WALLET_QUEST_ID && (
                                        <button
                                            onClick={verifyBalanceQuest}
                                            disabled={!!isVerifyingQuest}
                                            className="w-full px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isVerifyingQuest === quest.id ? (
                                                <span className="animate-pulse">Verifying...</span>
                                            ) : ( 
                                                'Verify Balance'
                                            )}
                                        </button>
                                    )}

                                    {quest.id === EXPLORE_TRANSACTION_QUEST_ID && (
                                        <div className="space-y-2">
                                             <label htmlFor={`quest-input-${quest.id}`} className="text-xs text-gray-400 block">Your Answer (Compute Units):</label>
                                             <input 
                                                id={`quest-input-${quest.id}`}
                                                type="text" // Keep as text to allow various inputs initially
                                                value={transactionQuestAnswer}
                                                onChange={(e) => setTransactionQuestAnswer(e.target.value)}
                                                className={`w-full px-3 py-2 bg-dark-input border rounded-md text-white focus:outline-none focus:ring-1 focus:ring-solana-purple text-sm ${questInputError[quest.id] ? 'border-red-500' : 'border-gray-600'}`}
                                                placeholder="e.g., 767"
                                                disabled={!!isVerifyingQuest}
                                            />
                                            {questInputError[quest.id] && <p className="text-red-500 text-xs mt-1">{questInputError[quest.id]}</p>}
                                            <button
                                                onClick={handleVerifyTransaction}
                                                disabled={!!isVerifyingQuest || !transactionQuestAnswer}
                                                className="w-full px-4 py-2 text-sm bg-teal-600 hover:bg-teal-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isVerifyingQuest === quest.id ? (
                                                    <span className="animate-pulse">Verifying...</span>
                                                ) : ( 
                                                    'Submit Answer'
                                                )}
                                            </button>
                                        </div>
                                    )}
                                    {/* Add more quest types here */}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 