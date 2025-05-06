'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { CheckCircleIcon, LockClosedIcon, SparklesIcon, InformationCircleIcon } from '@heroicons/react/24/solid'; // Import icons
import { ArrowPathIcon } from '@heroicons/react/24/outline'; // For loading state
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'; // Import Skeleton
import ReactMarkdown from 'react-markdown'; // Import react-markdown

// Define the Quest structure (reuse from profile page or define locally)
interface Quest {
    id: string;
    title: string;
    description: string;
    pathId: string; // Renamed from path for consistency with backend
    order: number;
    isCompleted: boolean;
    xpReward: number;
    verificationType?: 'signature' | 'balance_check' | 'input_answer' | 'community_link_click'; // Added
    actionText?: string; // Added for community quests
    actionUrl?: string; // Added for community quests
    correctAnswer?: string; 
}

// Define the backend API endpoint and auth token key
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const AUTH_TOKEN_KEY = 'solquest_auth_token';

// --- Helper Function for Learning Content ---
const getLearningContent = (questId: string, verificationType?: string): { intro: string; imageUrl?: string } => {
    // Handle new community quest IDs specifically if different content is needed for different paths
    // For now, generic messages for these types:
    if (verificationType === 'community_link_click') {
        if (questId.startsWith('visit-x')) {
            return {
                intro: "Follow us on X (formerly Twitter) to stay up-to-date with the latest SolQuest news, announcements, and alpha. Your engagement helps our community grow!"
            };
        }
        if (questId.startsWith('join-discord')) {
            return {
                intro: "Join our official Discord server to connect with other SolQuesters, ask questions, share your progress, and participate in community events. We're excited to have you!"
            };
        }
    }

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
        case 'find-nft-authority-1':
            return {
                intro: "NFTs on Solana often belong to a Collection. The Update Authority is a specific wallet address that has permission to change the metadata (like name, image, attributes) for *all* NFTs within that collection. Finding this authority address on a block explorer helps verify the legitimacy of a collection.",
            };
        case 'find-first-tx-1':
            return {
                intro: "Every action on Solana is recorded as a transaction. Block explorers provide a complete, publicly accessible history of all transactions associated with a wallet address. By examining this history, you can trace the entire activity of an account back to its creation or first interaction on the network.",
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
    const [nftAuthorityAnswer, setNftAuthorityAnswer] = useState(''); // Input for find-nft-authority-1 quest
    const [firstTxAnswer, setFirstTxAnswer] = useState(''); // Add state for the new quest's input

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

    // Generic handler for quests requiring a simple string answer submission
    const handleVerifyAnswer = useCallback(async (questId: string, answer: string) => {
        if (!authToken || !answer.trim()) {
            // Basic validation, specific checks might be needed per quest type
            setQuestActionError(prev => ({ ...prev, [questId]: 'Please enter an answer.' })); 
            return;
        }
        console.log(`Verifying answer for quest: ${questId}, Answer: ${answer}`);
        setIsVerifying(prev => ({ ...prev, [questId]: true }));
        setQuestActionError(prev => ({ ...prev, [questId]: null }));
        
        try {
            const response = await fetch(`${BACKEND_URL}/api/quests/verify-answer`, { // Use the generic route
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ questId, answer: answer.trim() })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to verify answer.');

            console.log(`Quest ${questId} verification success:`, data);
            await fetchPathQuests(authToken); // Refetch quests on success
            
            // Clear relevant input field after successful verification
            if (questId === 'explore-transaction-1') setTransactionAnswer('');
            if (questId === 'find-nft-authority-1') setNftAuthorityAnswer('');
            if (questId === 'find-first-tx-1') setFirstTxAnswer(''); // Clear new state
            
        } catch (error: any) {
            console.error(`Error verifying answer for ${questId}:`, error);
            setQuestActionError(prev => ({ ...prev, [questId]: error.message || 'An unknown error occurred.' }));
        } finally {
            setIsVerifying(prev => ({ ...prev, [questId]: false }));
        }
    }, [authToken, fetchPathQuests]);

    // --- Skeleton Components ---
    const QuestStepSkeleton = () => (
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center p-3 rounded-lg border border-gray-700 bg-gray-800/60 min-w-[180px]">
                    <Skeleton circle height={16} width={16} className="mr-2"/>
                    <Skeleton height={16} width={20} className="mr-2" />
                    <Skeleton height={16} width={80} />
                </div>
            ))}
        </div>
    );

    const QuestDetailsSkeleton = () => (
        <div className="p-6 bg-dark-card rounded-lg border border-white/10">
            <Skeleton height={28} width="50%" className="mb-4"/>
            {/* Learn Section Skeleton */}
            <div className="mb-6 p-4 bg-dark-card-secondary rounded-lg border border-white/5">
                <Skeleton height={20} width="20%" className="mb-2"/>
                <Skeleton count={3} />
            </div>
            {/* Task Section Skeleton */}
            <div className="mb-4">
                 <Skeleton height={20} width="15%" className="mb-2"/>
                 <Skeleton height={18} />
            </div>
            {/* Action Section Skeleton */}
            <div>
                <Skeleton height={40} width="120px" />
            </div>
        </div>
    );

    // --- Render Logic ---
    if (!authToken && !isLoading) { // Show loading until token check finishes or redirect happens
        return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p className="text-gray-400">Loading...</p></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p className="text-red-500">Error: {error}</p></div>;
    }
    
    const selectedQuest = !isLoading && quests.length > 0 ? quests[selectedQuestIndex] : null;
    const learningContent = selectedQuest ? getLearningContent(selectedQuest.id, selectedQuest.verificationType) : null;

    const isStepLocked = (index: number) => {
         if (isLoading || quests.length === 0) return true; // Assume locked while loading
         if (index === 0) return false;
         return quests.slice(0, index).some(q => !q.isCompleted);
    };

    if (isLoading) {
        return (
            <SkeletonTheme baseColor="#202020" highlightColor="#444">
                <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl">
                    {/* Skeleton for Stepper */}
                    <div className="mb-8">
                        <QuestStepSkeleton />
                    </div>
                    {/* Skeleton for Quest Details */}
                    <QuestDetailsSkeleton />
                </div>
            </SkeletonTheme>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 p-8">Error loading quests: {error}</div>;
    }

    if (!quests.length && !isLoading) {
        return <div className="text-center text-gray-400 p-8">No quests found for this path.</div>;
    }
    
    if (!selectedQuest && quests.length > 0 && !isLoading) {
         // This case should ideally not happen if selectedQuestIndex is managed correctly
         // but as a fallback, select the first quest if selectedQuest is somehow undefined.
         setSelectedQuestIndex(0); 
         return <div className="text-center text-gray-400 p-8">Loading quest details...</div>;
    }
    
    // Fallback if selectedQuest is still undefined after trying to set default
    if (!selectedQuest) {
        return <div className="text-center text-gray-400 p-8">Please select a quest.</div>;
    }

    const { intro, imageUrl } = getLearningContent(selectedQuest.id, selectedQuest.verificationType);

    // Path title for display
    const pathTitle = pathId ? pathId.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Quest';

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl min-h-screen">
            <h1 className="text-3xl font-bold mb-2 text-center text-white">
                {pathTitle} Path
            </h1>
            <p className="text-center text-gray-400 mb-8">
                Complete the quests below to learn and earn XP!
            </p>

            <div className="flex flex-col md:flex-row md:space-x-6 lg:space-x-8">
                {/* Left Column: Vertical Quest Navigation */}
                <div className="md:w-1/3 lg:w-1/4 mb-8 md:mb-0 md:sticky md:top-24 self-start" style={{ maxHeight: 'calc(100vh - 7rem)', overflowY: 'auto' }}>
                     <h2 className="text-xl font-semibold mb-4 text-gray-100 md:sticky md:top-0 bg-dark-background py-2 z-10">Quests</h2>
                     <div className="space-y-2 pr-2"> {/* Added pr-2 for scrollbar spacing */}
                        {quests.map((quest, index) => {
                            const isLocked = isStepLocked(index);
                            const isActive = index === selectedQuestIndex;
                            return (
                                <button
                                    key={quest.id}
                                    onClick={() => !isLocked && setSelectedQuestIndex(index)}
                                    disabled={isLocked}
                                    className={`w-full flex items-center text-left p-3 rounded-md border transition-all duration-150 ease-in-out 
                                        ${isLocked ? 'opacity-60 cursor-not-allowed bg-dark-card-secondary border-gray-700' : 'hover:bg-gray-700/70'}
                                        ${isActive && !isLocked ? 'bg-solana-purple/20 border-solana-purple shadow-lg text-white ring-1 ring-solana-purple' : 'bg-dark-card-secondary border-gray-700 text-gray-300'}
                                        ${quest.isCompleted ? 'border-solana-green/60 bg-solana-green/5 hover:bg-solana-green/10' : ''}
                                    `}
                                >
                                    {quest.isCompleted ? <CheckCircleIcon className="h-5 w-5 text-solana-green mr-3 flex-shrink-0" />
                                     : isLocked ? <LockClosedIcon className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                                     : isActive ? <SparklesIcon className="h-5 w-5 text-solana-purple mr-3 flex-shrink-0 animate-pulse" />
                                     : <span className={`h-3 w-3 border-2 ${isActive ? 'border-solana-purple' : 'border-gray-500'} rounded-full mr-3 ml-1 flex-shrink-0`}></span> // Adjusted margin for alignment
                                    }
                                    <span className="truncate text-sm">{quest.title}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Selected Quest Details */}
                <div className="md:w-2/3 lg:w-3/4">
                    {selectedQuest ? (
                        <div className="p-6 bg-dark-card rounded-lg border border-white/10">
                            <h2 className="text-2xl font-bold mb-1 text-white">{selectedQuest.title}</h2>
                            <p className="text-sm text-solana-green mb-4">+{selectedQuest.xpReward} XP</p>
                            
                            {/* Learning Content Section */}
                            <div className="mb-6 p-4 bg-dark-card-secondary rounded-lg border border-white/5">
                                <h3 className="text-lg font-semibold text-gray-200 mb-2">Learn More</h3>
                                <div className="text-gray-300 prose prose-sm prose-invert max-w-none">
                                    <ReactMarkdown 
                                        components={{
                                            a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-solana-purple hover:underline"/>,
                                        }}
                                    >
                                        {intro}
                                    </ReactMarkdown>
                                </div>
                                {imageUrl && <img src={imageUrl} alt="Quest learning material" className="mt-4 rounded-md" />}
                            </div>

                            {/* Quest Objective / Description */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-200 mb-2">Objective</h3>
                                <div className="text-gray-300 prose prose-sm prose-invert max-w-none">
                                    <ReactMarkdown 
                                         components={{
                                             a: ({node, ...props}: {node?: any; [key: string]: any}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-solana-purple hover:underline"/>,
                                             code: ({node, inline, className, children, ...htmlProps}: {node?: any; inline?: boolean; className?: string; children?: React.ReactNode; [key: string]: any;}) => {
                                                const match = /language-(\w+)/.exec(className || '');
                                                if (!inline && match) {
                                                  return (
                                                    <pre className={`${className || ''} bg-gray-800 p-2 rounded overflow-x-auto`} {...htmlProps}>
                                                      <code>{children}</code>
                                                    </pre>
                                                  );
                                                }
                                                return (
                                                  <code className={`${className || ''} bg-gray-700 text-solana-yellow rounded px-1 py-0.5 text-xs`} {...htmlProps}>
                                                    {children}
                                                  </code>
                                                );
                                              }
                                         }}
                                    >
                                        {selectedQuest.description}
                                    </ReactMarkdown>
                                </div>
                            </div>
                            
                            {/* Quest Action Area */}
                            <div className="mt-4">
                                {selectedQuest.isCompleted ? (
                                    <div className="flex items-center text-solana-green p-3 bg-solana-green/10 rounded-md">
                                        <CheckCircleIcon className="h-6 w-6 mr-2" />
                                        <span className="font-semibold">Quest Completed!</span>
                                    </div>
                                ) : (
                                    <>
                                        {/* Specific Quest Type Inputs/Actions */}
                                        {selectedQuest.verificationType === 'balance_check' && selectedQuest.id === 'fund-wallet' && (
                                    <button
                                        onClick={() => handleVerifyBalance(selectedQuest.id)}
                                        disabled={isVerifying[selectedQuest.id]}
                                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-solana-purple hover:bg-solana-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-purple-light disabled:opacity-50 transition-colors duration-150"
                                    >
                                        {isVerifying[selectedQuest.id] ? <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" /> : <SparklesIcon className="h-5 w-5 mr-2" />}
                                        Verify Balance (0.01 SOL)
                                    </button>
                                )}

                                {selectedQuest.verificationType === 'input_answer' && selectedQuest.id === 'explore-transaction-1' && (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                        <input
                                            type="text"
                                            value={transactionAnswer}
                                            onChange={(e) => setTransactionAnswer(e.target.value)}
                                            placeholder="Enter Compute Units (e.g., 150000)"
                                            className="flex-grow p-3 bg-dark-background border border-gray-600 rounded-md focus:ring-solana-purple focus:border-solana-purple text-white placeholder-gray-500"
                                        />
                                        <button
                                            onClick={() => handleVerifyAnswer(selectedQuest.id, transactionAnswer)}
                                            disabled={isVerifying[selectedQuest.id] || !transactionAnswer.trim()}
                                            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-solana-green hover:bg-solana-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-green-dark disabled:opacity-50 transition-colors duration-150"
                                        >
                                            {isVerifying[selectedQuest.id] ? <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" /> : <CheckCircleIcon className="h-5 w-5 mr-2" />}
                                            Submit Answer
                                        </button>
                                    </div>
                                )}
                                 {selectedQuest.verificationType === 'input_answer' && selectedQuest.id === 'find-nft-authority-1' && (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                        <input
                                            type="text"
                                            value={nftAuthorityAnswer}
                                            onChange={(e) => setNftAuthorityAnswer(e.target.value)}
                                            placeholder="Enter Update Authority Address"
                                            className="flex-grow p-3 bg-dark-background border border-gray-600 rounded-md focus:ring-solana-purple focus:border-solana-purple text-white placeholder-gray-500"
                                        />
                                        <button
                                            onClick={() => handleVerifyAnswer(selectedQuest.id, nftAuthorityAnswer)}
                                            disabled={isVerifying[selectedQuest.id] || !nftAuthorityAnswer.trim()}
                                            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-solana-green hover:bg-solana-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-green-dark disabled:opacity-50 transition-colors duration-150"
                                        >
                                            {isVerifying[selectedQuest.id] ? <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" /> : <CheckCircleIcon className="h-5 w-5 mr-2" />}
                                            Submit Answer
                                        </button>
                                    </div>
                                )}
                                {selectedQuest.verificationType === 'input_answer' && selectedQuest.id === 'find-first-tx-1' && (
                                     <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                        <input
                                            type="text"
                                            value={firstTxAnswer}
                                            onChange={(e) => setFirstTxAnswer(e.target.value)}
                                            placeholder="Enter First Transaction Signature"
                                            className="flex-grow p-3 bg-dark-background border border-gray-600 rounded-md focus:ring-solana-purple focus:border-solana-purple text-white placeholder-gray-500"
                                        />
                                        <button
                                            onClick={() => handleVerifyAnswer(selectedQuest.id, firstTxAnswer)}
                                            disabled={isVerifying[selectedQuest.id] || !firstTxAnswer.trim()}
                                            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-solana-green hover:bg-solana-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-green-dark disabled:opacity-50 transition-colors duration-150"
                                        >
                                            {isVerifying[selectedQuest.id] ? <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" /> : <CheckCircleIcon className="h-5 w-5 mr-2" />}
                                            Submit Answer
                                        </button>
                                    </div>
                                )}

                                {/* --- NEW: Community Link Click Quest Type --- */}
                                {selectedQuest.verificationType === 'community_link_click' && (
                                    <div className="space-y-3 sm:space-y-0 sm:flex sm:space-x-3">
                                        <a
                                            href={selectedQuest.actionUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-solana-purple hover:bg-solana-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-purple-light transition-colors duration-150"
                                        >
                                            {selectedQuest.actionText || 'Open Link'} 
                                            <SparklesIcon className="ml-2 h-5 w-5" /> {/* Using SparklesIcon as an example, could be ExternalLinkIcon */}
                                        </a>
                                        {!selectedQuest.isCompleted && ( // Only show confirm button if not completed
                                            <button
                                                onClick={() => handleVerifyAnswer(selectedQuest.id, 'action_confirmed')}
                                                disabled={isVerifying[selectedQuest.id]}
                                                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-solana-green text-base font-medium rounded-md text-solana-green hover:bg-solana-green/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                                            >
                                                {isVerifying[selectedQuest.id] ? (
                                                    <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                                                ) : (
                                                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                                                )}
                                                I've Done This!
                                            </button>
                                        )}
                                    </div>
                                )}

                                        {/* Display error for the current quest, if any */}
                                        {questActionError[selectedQuest.id] && (
                                            <div className="mt-3 text-sm text-red-500 bg-red-500/10 p-3 rounded-md flex items-center">
                                                <InformationCircleIcon className="h-5 w-5 mr-2" />
                                                {questActionError[selectedQuest.id]}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        !isLoading && quests.length > 0 && (
                            <div className="p-6 bg-dark-card rounded-lg border border-white/10 text-center text-gray-400">
                                <p>Select a quest from the list to get started.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
} 