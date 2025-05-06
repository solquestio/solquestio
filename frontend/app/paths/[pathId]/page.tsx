'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { CheckCircleIcon, LockClosedIcon, SparklesIcon, InformationCircleIcon } from '@heroicons/react/24/solid'; // Import icons
import { ArrowPathIcon } from '@heroicons/react/24/outline'; // For loading state

// Define the Quest structure (reuse from profile page or define locally)
interface Quest {
    id: string;
    title: string;
    description: string;
    path: string;
    order: number;
    isCompleted: boolean;
    xpReward: number;
    // Add optional fields specific to quest types if needed
    correctAnswer?: string; // For verify-transaction quest
}

// Define the backend API endpoint and auth token key
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const AUTH_TOKEN_KEY = 'solquest_auth_token';

// --- Helper Function for Learning Content ---
const getLearningContent = (questId: string): { intro: string; imageUrl?: string } => {
    switch (questId) {
        case 'verify-wallet':
            return {
                intro: "Verifying wallet ownership proves you control the private keys associated with your public wallet address. It's a fundamental step in interacting securely with decentralized applications (dApps). This is usually done by signing a unique message provided by the dApp, demonstrating your key ownership without revealing the keys themselves.",
                // imageUrl: "/images/wallet-verification.png" // Placeholder
            };
        case 'fund-wallet':
            return {
                intro: "SOL is the native cryptocurrency of the Solana blockchain. It's used to pay for transaction fees (like sending tokens or interacting with programs) and for staking to secure the network. Having a small amount of SOL (we recommend at least 0.01 SOL for this quest) is essential to perform most actions on Solana. \n\n**How to get SOL?** You can acquire SOL from major cryptocurrency exchanges like Coinbase, Binance, Kraken, or FTX. Alternatively, for small amounts for testing, you might find a 'Solana faucet' online, though mainnet faucets are less common.",
                // imageUrl: "/images/solana-logo-exchanges.png" // Placeholder
            };
        case 'explore-transaction-1':
            return {
                intro: "Block explorers are tools that allow anyone to view the details of blockchain transactions and addresses. They provide transparency into the network. Compute Units (CUs) on Solana measure the computational resources consumed by a transaction. Optimizing CU usage is important for developers to make their applications efficient and cost-effective.",
                // imageUrl: "/images/block-explorer.png" // Placeholder
            };
        default:
            return { intro: "Complete the quest objective to earn XP and progress!" };
    }
};

export default function QuestPathPage() {
    const router = useRouter();
    const params = useParams();
    const { connected } = useWallet(); // Check connection status
    const pathId = params.pathId as string; // Get pathId from URL

    const [quests, setQuests] = useState<Quest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [selectedQuestIndex, setSelectedQuestIndex] = useState(0); // Track selected step

    // State for quest actions
    const [isVerifying, setIsVerifying] = useState<{[key: string]: boolean}>({}); // Track loading state per quest
    const [questActionError, setQuestActionError] = useState<{[key: string]: string | null}>({}); // Track errors per quest
    const [transactionAnswer, setTransactionAnswer] = useState(''); // Input for transaction quest

    // --- Authentication and Initial Load ---
    useEffect(() => {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        if (storedToken) {
            setAuthToken(storedToken);
        } else {
            // If no token, redirect to login/home page
            console.log('No auth token found, redirecting...');
            router.push('/'); // Or a dedicated login page
        }
    }, [router]);

    // --- Fetch Quests --- 
    const fetchPathQuests = useCallback(async (token: string) => {
        if (!pathId || !token) return;
        setIsLoading(true);
        setError(null);
        console.log(`Fetching quests for path: ${pathId}`);
        try {
            const response = await fetch(`${BACKEND_URL}/api/quests/path/${pathId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) { 
                if (response.status === 401) {
                    // Handle unauthorized access - maybe token expired
                    localStorage.removeItem(AUTH_TOKEN_KEY);
                    setAuthToken(null);
                    setError('Session expired. Please log in again.');
                    router.push('/'); // Redirect on auth error
                    return; // Stop further processing
                }
                throw new Error(data.message || `Failed to fetch quests for path ${pathId}`); 
            }
            console.log('Path quests fetched:', data);
            
            // Sort quests by order before setting state
            const sortedQuests = (data as Quest[]).sort((a, b) => a.order - b.order);
            setQuests(sortedQuests);
            
            // Set initial selected quest index to the first incomplete quest
            const firstIncompleteIndex = sortedQuests.findIndex(q => !q.isCompleted);
            setSelectedQuestIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0); // Default to 0 if all completed or no quests

        } catch (err: any) {
            console.error('Error fetching path quests:', err);
            setError(`Failed to load quests: ${err.message}`);
            setQuests([]);
        } finally {
            setIsLoading(false);
        }
    }, [pathId, router]);

    // Effect to trigger fetch when token is available
    useEffect(() => {
        if (authToken) {
            fetchPathQuests(authToken);
        }
    }, [authToken, fetchPathQuests]);

    // --- Quest Action Handlers ---
    const handleVerifyBalance = useCallback(async (questId: string) => {
        if (!authToken) return;
        console.log(`Verifying balance for quest: ${questId}`);
        setIsVerifying(prev => ({ ...prev, [questId]: true }));
        setQuestActionError(prev => ({ ...prev, [questId]: null }));

        try {
            const response = await fetch(`${BACKEND_URL}/api/quests/check-balance`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json' // Ensure content type is set
                },
                // No body needed for this specific endpoint as per backend implementation
            });

            const data = await response.json();

            if (!response.ok) {
                // Throw error with message from backend if available
                throw new Error(data.message || 'Failed to verify balance quest');
            }

            console.log('Balance quest verification response:', data);

            // Check if the quest was actually completed in this call
            // The backend sends back the user object. We need to compare its completed quests 
            // with the previous state, or simply check if the specific questId is now completed.
            // Re-fetching the quests is the simplest way to update the UI state accurately.
            if (data.questCompleted) { 
                console.log(`Quest ${questId} reported as completed by backend.`);
                 await fetchPathQuests(authToken); // Refetch quests to update UI
            } else {
                 console.log(`Quest ${questId} balance check done, but quest not completed (likely insufficient balance or already done).`);
                 // Optionally show a specific message if balance wasn't sufficient
                 if (data.message && data.message.includes('not sufficient')) {
                      setQuestActionError(prev => ({ ...prev, [questId]: 'Your SOL balance is not sufficient to complete this quest.' }));
                 } else {
                      // If already completed previously, refetch might still be good
                       await fetchPathQuests(authToken);
                 }
            }

        } catch (error: any) {
            console.error('Error verifying balance quest:', error);
            setQuestActionError(prev => ({ ...prev, [questId]: error.message || 'An unknown error occurred.' }));
        } finally {
            setIsVerifying(prev => ({ ...prev, [questId]: false }));
        }
    }, [authToken, fetchPathQuests]); // Added fetchPathQuests dependency

    const handleVerifyTransaction = useCallback(async (questId: string) => {
        if (!authToken || !transactionAnswer.trim()) {
            setQuestActionError(prev => ({ ...prev, [questId]: 'Please enter an answer.' }));
            return;
        }
        console.log(`Verifying transaction answer for quest: ${questId}, Answer: ${transactionAnswer}`);
        setIsVerifying(prev => ({ ...prev, [questId]: true }));
        setQuestActionError(prev => ({ ...prev, [questId]: null }));
        
        try {
            const response = await fetch(`${BACKEND_URL}/api/quests/verify-transaction`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    questId: questId,
                    answer: transactionAnswer.trim() // Send trimmed answer
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to verify transaction answer.');
            }

            console.log('Transaction quest verification success:', data);
            
            // Clear input and refetch quests on success
            setTransactionAnswer(''); 
            await fetchPathQuests(authToken); 

        } catch (error: any) {
            console.error('Error verifying transaction quest:', error);
            // Display specific error message from backend if available
            setQuestActionError(prev => ({ ...prev, [questId]: error.message || 'An unknown error occurred.' }));
        } finally {
            setIsVerifying(prev => ({ ...prev, [questId]: false }));
        }
    }, [authToken, transactionAnswer, fetchPathQuests]); // Added dependencies

    // --- Render Logic ---
    if (!authToken) {
        // Still waiting for token check or redirecting
        return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p className="text-gray-400">Loading...</p></div>;
    }

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p className="text-gray-400">Loading Quests...</p></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p className="text-red-500">Error: {error}</p></div>;
    }

    if (quests.length === 0) {
        return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p className="text-gray-400">No quests found for this path.</p></div>;
    }
    
    const selectedQuest = quests[selectedQuestIndex];
    const learningContent = getLearningContent(selectedQuest.id);

    const isStepLocked = (index: number) => {
         if (index === 0) return false; // First step is never locked
         // A step is locked if any *previous* step is not completed
         return quests.slice(0, index).some(q => !q.isCompleted);
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center capitalize">{pathId.replace('-', ' ')} Path</h1>
            <p className="text-center text-gray-400 mb-10">Complete the steps below to learn and earn XP!</p>

            {/* Enhanced QuestPathStepper */}
            <div className="mb-10 p-4 bg-dark-card rounded-lg border border-white/10 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-100">Quest Steps</h2>
                <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    {quests.map((quest, index) => {
                        const isLocked = isStepLocked(index);
                        const isActive = index === selectedQuestIndex && !isLocked;
                        const isCompleted = quest.isCompleted;
                        
                        let statusClasses = 'bg-gray-800/60 border-gray-700 text-gray-400';
                        let icon = <LockClosedIcon className="h-4 w-4 mr-2 flex-shrink-0" />;

                        if (isCompleted) {
                            statusClasses = 'bg-green-900/40 border-green-700 text-green-300';
                            icon = <CheckCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />;
                        } else if (isActive) {
                            statusClasses = 'bg-solana-purple/80 border-solana-purple text-white ring-2 ring-solana-purple/80 ring-offset-2 ring-offset-dark-background shadow-md';
                            icon = <SparklesIcon className="h-4 w-4 mr-2 flex-shrink-0 animate-pulse" />;
                        } else { // Default for non-active, non-completed, but potentially unlocked steps
                             statusClasses = 'bg-gray-800/60 border-gray-700 text-gray-400';
                             icon = <InformationCircleIcon className="h-4 w-4 mr-2 flex-shrink-0 opacity-70" />;
                             if (isLocked) {
                                 icon = <LockClosedIcon className="h-4 w-4 mr-2 flex-shrink-0" />;
                             }
                        }
                        
                        return (
                            <button 
                                key={quest.id} 
                                onClick={() => !isLocked && setSelectedQuestIndex(index)} // Only allow selecting non-locked steps
                                disabled={isLocked} 
                                className={`flex items-center p-3 rounded-lg border min-w-[180px] transition-all duration-200 ${statusClasses} ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
                            >
                                {icon}
                                <span className="font-mono text-xs mr-2 p-1 bg-black/20 rounded">{String(index + 1).padStart(2, '0')}</span>
                                <span className="text-sm font-medium truncate">{quest.title}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Enhanced QuestStepDetails */}
            <div className="p-6 bg-dark-card rounded-lg border border-white/10 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Step {selectedQuestIndex + 1}: {selectedQuest.title}</h3>

                {/* Learning Section */} 
                 <div className="mb-6 p-4 bg-dark-card-secondary rounded-lg border border-white/5">
                    <h4 className="text-md font-semibold mb-2 text-solana-purple">Learn</h4>
                     {/* Optional Image Placeholder */}
                     {/* {learningContent.imageUrl && <img src={learningContent.imageUrl} alt={`${selectedQuest.title} visual`} className="w-32 h-auto float-right m-2 rounded" />} */} 
                    <p className="text-gray-300 text-sm leading-relaxed">{learningContent.intro}</p>
                </div>

                {/* Task Section */} 
                <div className="mb-4">
                    <h4 className="text-md font-semibold mb-2 text-solana-purple">Task</h4>
                    <p className="text-gray-300 text-sm mb-4">{selectedQuest.description}</p>
                </div>

                {/* Action/Status Section */} 
                <div>
                    {isStepLocked(selectedQuestIndex) ? (
                        <div className="flex items-center p-3 rounded-md bg-yellow-900/30 border border-yellow-700">
                            <LockClosedIcon className="h-5 w-5 mr-2 text-yellow-400 flex-shrink-0" />
                            <p className="text-yellow-400 text-sm font-medium">This step unlocks after completing prior steps.</p>
                        </div>
                    ) : selectedQuest.isCompleted ? (
                         <div className="flex items-center p-3 rounded-md bg-green-900/30 border border-green-700">
                             <CheckCircleIcon className="h-5 w-5 mr-2 text-green-400 flex-shrink-0" />
                             <p className="text-green-400 text-sm font-semibold">Completed (+{selectedQuest.xpReward} XP)</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                             {/* Specific Quest Actions */} 
                            {selectedQuest.id === 'fund-wallet' && (
                                <button 
                                    onClick={() => handleVerifyBalance(selectedQuest.id)}
                                    disabled={isVerifying[selectedQuest.id]}
                                    className="inline-flex items-center bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to text-white px-5 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait"
                                >
                                    {isVerifying[selectedQuest.id] ? <ArrowPathIcon className="animate-spin h-4 w-4 mr-2"/> : null}
                                    {isVerifying[selectedQuest.id] ? 'Verifying...' : 'Verify Balance'}
                                </button>
                            )}
                             {selectedQuest.id === 'explore-transaction-1' && (
                                <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3'>
                                    <input 
                                        type='text' 
                                        placeholder='Enter Compute Units' 
                                        value={transactionAnswer}
                                        onChange={(e) => setTransactionAnswer(e.target.value)}
                                        className='bg-dark-input border border-gray-600 rounded-md px-3 py-1.5 text-sm w-full sm:w-auto flex-grow focus:ring-1 focus:ring-solana-purple focus:outline-none'
                                        disabled={isVerifying[selectedQuest.id]}
                                    />
                                    <button 
                                        onClick={() => handleVerifyTransaction(selectedQuest.id)}
                                        disabled={isVerifying[selectedQuest.id] || !transactionAnswer}
                                        className="inline-flex items-center bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to text-white px-5 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait w-full sm:w-auto"
                                    >
                                        {isVerifying[selectedQuest.id] ? <ArrowPathIcon className="animate-spin h-4 w-4 mr-2"/> : null}
                                         {isVerifying[selectedQuest.id] ? 'Verifying...' : 'Verify Answer'}
                                    </button>
                                </div>
                            )}
                             {/* Fallback for verify-wallet or others */}
                             {selectedQuest.id === 'verify-wallet' && (
                                <div className="flex items-center p-3 rounded-md bg-blue-900/30 border border-blue-700">
                                    <InformationCircleIcon className="h-5 w-5 mr-2 text-blue-400 flex-shrink-0" />
                                    <p className="text-blue-400 text-sm italic">This step is completed automatically upon verifying your wallet on the profile page.</p> 
                                </div>
                            )}
                            
                            {/* Display Action Errors */}
                            {questActionError[selectedQuest.id] && (
                                <p className="text-red-500 text-xs mt-1">Error: {questActionError[selectedQuest.id]}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
} 