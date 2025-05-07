'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { CheckCircleIcon, LockClosedIcon, SparklesIcon, InformationCircleIcon, CheckIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

// Interfaces (Quest, Path Metadata - potentially fetch path title too)
interface Quest {
    id: string;
    title: string;
    description: string;
    pathId: string; 
    order: number;
    isCompleted: boolean;
    xpReward: number;
    verificationType?: 'signature' | 'balance_check' | 'input_answer' | 'community_link_click';
    actionText?: string; 
    actionUrl?: string; 
    correctAnswer?: string; 
}

interface PathMetadata {
    id: string;
    title: string;
    description?: string;
    // Add other relevant path fields if needed
}

// Constants
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
            };
        case 'fund-wallet':
            return {
                intro: "SOL is the native cryptocurrency of the Solana blockchain. It's used to pay for transaction fees (like sending tokens or interacting with programs) and for staking to secure the network. Having a small amount of SOL (we recommend at least 0.01 SOL for this quest) is essential to perform most actions on Solana. \n\n**How to get SOL?** You can acquire SOL from major cryptocurrency exchanges like Coinbase, Binance, Kraken, or FTX. Alternatively, for small amounts for testing, you might find a 'Solana faucet' online, though mainnet faucets are less common.",
            };
        case 'explore-transaction-1':
            return {
                intro: "Block explorers are tools that allow anyone to view the details of blockchain transactions and addresses. They provide transparency into the network. Compute Units (CUs) on Solana measure the computational resources consumed by a transaction. Optimizing CU usage is important for developers to make their applications efficient and cost-effective.",
            };
        case 'find-nft-authority-1':
            return {
                intro: "NFTs on Solana often belong to a Collection. The Update Authority is a specific wallet address that has permission to change the metadata (like name, image, attributes) for *all* NFTs within that collection. Finding this authority address on a block explorer helps verify the legitimacy of a collection.",
            };
        case 'find-first-tx-1':
            return {
                intro: "Every action on Solana is recorded as a transaction. Block explorers provide a complete, publicly accessible history of all transactions associated with a wallet address. By examining this history, you can trace the entire activity of an account back to its creation or first interaction on the network.",
            };
        case 'mint-og-nft':
            return {
                intro: "Minting an NFT (Non-Fungible Token) means creating a unique digital asset on the blockchain. For the SolQuest OG NFT, this signifies your status as an early supporter and member of our community. The mint transaction itself records your ownership permanently on Solana. This quest helps you understand the practical step of acquiring a unique digital item."
            };
        case 'refer-friend-og':
            return {
                intro: "Web3 communities thrive on growth and network effects. Referring a friend helps expand the SolQuest ecosystem, bringing more users to learn about Solana. This process often involves sharing a unique link or code, and it fosters a sense of shared discovery and participation."
            };
        default:
            return { intro: "Complete the quest objective to earn XP and progress!" };
    }
};

export default function QuestPathPage() {
    const router = useRouter();
    const params = useParams();
    const { connected } = useWallet();
    const pathId = params.pathId as string;

    const [quests, setQuests] = useState<Quest[]>([]);
    const [pathMetadata, setPathMetadata] = useState<PathMetadata | null>(null); // State for path title/desc
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [selectedQuestIndex, setSelectedQuestIndex] = useState<number>(0);

    // State for quest actions
    const [isVerifying, setIsVerifying] = useState<{[key: string]: boolean}>({});
    const [questActionError, setQuestActionError] = useState<{[key: string]: string | null}>({});
    const [inputAnswers, setInputAnswers] = useState<{[key: string]: string}>({}); // Single state for all input answers

    // --- Authentication and Initial Load ---
    useEffect(() => {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!storedToken) {
            console.log('No auth token found, redirecting to home page...');
            router.push('/');
        } else {
            setAuthToken(storedToken);
        }
    }, [router]);

    // --- Fetch Path Metadata (Title) --- 
    const fetchPathMetadata = useCallback(async () => {
        try {
            // Assuming the paths endpoint can give basic info by ID, or fetch all and filter
            // Adjust endpoint if needed
            const response = await fetch(`${BACKEND_URL}/api/quests/paths`); 
            if (!response.ok) throw new Error('Failed to fetch path metadata');
            const data = await response.json();
            const paths = data.paths || (Array.isArray(data) ? data : []);
            const currentPath = paths.find((p: PathMetadata) => p.id === pathId);
            if (currentPath) {
                setPathMetadata(currentPath);
            } else {
                 setError('Path not found.'); // Set error if path doesn't exist
            }
        } catch (err: any) {
            console.error('Error fetching path metadata:', err);
            setError('Failed to load path details.');
        }
    }, [pathId]);

    // --- Fetch Quests --- 
    const fetchPathQuests = useCallback(async (token: string) => {
        if (!pathId || !token) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${BACKEND_URL}/api/quests/path/${pathId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) { 
                if (response.status === 401) {
                    localStorage.removeItem(AUTH_TOKEN_KEY);
                    setAuthToken(null);
                    setError('Session expired. Please log in again.');
                    router.push('/'); 
                    return; 
                }
                throw new Error(data.message || `Failed to fetch quests (status: ${response.status})`); 
            }
            
            const sortedQuests = (data as Quest[]).sort((a, b) => a.order - b.order);
            setQuests(sortedQuests);
            
            const firstIncompleteIndex = sortedQuests.findIndex(q => !q.isCompleted);
            // Ensure initial selection doesn't exceed bounds if all are complete
            const initialIndex = firstIncompleteIndex >= 0 ? firstIncompleteIndex : (sortedQuests.length > 0 ? sortedQuests.length - 1 : 0);
            setSelectedQuestIndex(initialIndex); 

        } catch (err: any) {
            console.error('Error fetching path quests:', err);
            setError(`Failed to load quests: ${err.message}`);
            setQuests([]);
        } finally {
            setIsLoading(false);
        }
    }, [pathId, router]);

    // Combined effect for initial load
    useEffect(() => {
        fetchPathMetadata();
        if (authToken) {
            fetchPathQuests(authToken);
        }
    }, [authToken, fetchPathMetadata, fetchPathQuests]);

     // Function to handle input changes for any input quest
    const handleInputChange = (questId: string, value: string) => {
        setInputAnswers(prev => ({ ...prev, [questId]: value }));
    };

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
                    'Content-Type': 'application/json' 
                },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to verify balance quest');
            if (data.questCompleted) { 
                 await fetchPathQuests(authToken); // Refetch quests to update UI
            } else {
                 if (data.message && data.message.includes('not sufficient')) {
                      setQuestActionError(prev => ({ ...prev, [questId]: 'Your SOL balance is not sufficient.' }));
                 } else {
                     setQuestActionError(prev => ({ ...prev, [questId]: data.message || 'Verification done, but quest not completed.' }));
                 }
            }
        } catch (error: any) {
            console.error('Error verifying balance quest:', error);
            setQuestActionError(prev => ({ ...prev, [questId]: error.message || 'An unknown error occurred.' }));
        } finally {
            setIsVerifying(prev => ({ ...prev, [questId]: false }));
        }
    }, [authToken, fetchPathQuests]);

    // Generic handler for quests requiring a simple string answer submission
    const handleVerifyAnswer = useCallback(async (questId: string, answer: string) => {
         if (!authToken || !answer.trim()) {
            setQuestActionError(prev => ({ ...prev, [questId]: 'Please enter an answer.' })); 
            return;
        }
        console.log(`Verifying answer for quest: ${questId}, Answer: ${answer}`);
        setIsVerifying(prev => ({ ...prev, [questId]: true }));
        setQuestActionError(prev => ({ ...prev, [questId]: null }));
        
        try {
            const response = await fetch(`${BACKEND_URL}/api/quests/verify-answer`, {
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
            setInputAnswers(prev => ({ ...prev, [questId]: '' })); // Clear input on success
            
        } catch (error: any) {
            console.error(`Error verifying answer for ${questId}:`, error);
            setQuestActionError(prev => ({ ...prev, [questId]: error.message || 'An unknown error occurred.' }));
        } finally {
            setIsVerifying(prev => ({ ...prev, [questId]: false }));
        }
    }, [authToken, fetchPathQuests]);
    
    // Handler for confirming community actions
    const handleCommunityConfirm = useCallback(async (questId: string) => {
        // This simply calls the generic verify-answer endpoint with a specific answer
        await handleVerifyAnswer(questId, 'action_confirmed');
    }, [handleVerifyAnswer]);

    // --- Rendering Logic ---
    const currentQuest = quests.length > 0 && selectedQuestIndex < quests.length ? quests[selectedQuestIndex] : null;
    const learningContent = currentQuest ? getLearningContent(currentQuest.id, currentQuest.verificationType) : null;

    // --- Skeleton Components ---
    const QuestStepSkeleton = () => (
        <div className="flex items-center p-3 mb-1 bg-dark-card-secondary rounded-md opacity-50">
            <Skeleton circle height={24} width={24} baseColor="#374151" highlightColor="#4b5563" />
            <Skeleton height={16} width={120} baseColor="#374151" highlightColor="#4b5563" className="ml-3" />
        </div>
    );

    const QuestDetailsSkeleton = () => (
        <div className="bg-dark-card p-6 rounded-lg">
            <Skeleton height={28} width={200} baseColor="#374151" highlightColor="#4b5563" />
            <Skeleton height={16} width={80} baseColor="#374151" highlightColor="#4b5563" className="mt-1 mb-4" />
            <Skeleton count={3} baseColor="#374151" highlightColor="#4b5563" className="mb-2" />
            <Skeleton height={40} width={150} baseColor="#374151" highlightColor="#4b5563" className="mt-6" />
        </div>
    );
    
    // --- Main Render ---
    if (!authToken) {
        // Render nothing or a redirecting message while waiting for redirect
        return <div className="min-h-screen flex items-center justify-center bg-dark text-white">Redirecting...</div>;
    }

    if (error && !isLoading && quests.length === 0) {
        // Show significant error only if loading is done and there are no quests to show
         return <div className="min-h-screen flex items-center justify-center bg-dark text-red-400">Error: {error}</div>;
    }

    return (
        <SkeletonTheme baseColor="#202020" highlightColor="#444"> {/* Adjust skeleton colors */} 
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Path Title */} 
                 <div className="mb-8 text-center">
                     <h1 className="text-3xl font-bold text-white mb-2">
                         {pathMetadata?.title || <Skeleton width={250} />} 
                     </h1>
                     <p className="text-gray-400">
                         {pathMetadata?.description || "Complete the quests below to learn and earn XP!"}
                     </p>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Quest Sidebar */} 
                    <div className="lg:col-span-4 mb-8 lg:mb-0">
                        <div className="bg-dark-card-secondary p-4 rounded-lg shadow-lg">
                            <h2 className="text-lg font-semibold text-gray-200 mb-4">Quests</h2>
                            {isLoading ? (
                                <> 
                                    <QuestStepSkeleton />
                                    <QuestStepSkeleton />
                                    <QuestStepSkeleton />
                                </> 
                            ) : quests.length === 0 && !error ? (
                                 <p className="text-sm text-gray-500">No quests found for this path.</p>
                             ) : (
                                quests.map((quest, index) => {
                                    const isSelected = index === selectedQuestIndex;
                                    const Icon = quest.isCompleted ? CheckCircleIcon : (isSelected ? SparklesIcon : LockClosedIcon);
                                    const iconColor = quest.isCompleted ? 'text-solana-green' : (isSelected ? 'text-yellow-400' : 'text-gray-500');
                                    const stepClasses = `flex items-center p-3 mb-1 rounded-md transition-colors duration-150 ${isSelected ? 'bg-solana-purple/20 border border-solana-purple' : 'hover:bg-gray-700/50 border border-transparent'}`;
                                    
                                    return (
                                        <button 
                                            key={quest.id}
                                            onClick={() => setSelectedQuestIndex(index)}
                                            className={`w-full text-left ${stepClasses} ${quest.isCompleted ? 'opacity-70' : ''}`}
                                            disabled={isLoading} // Disable clicks while loading all quests
                                        >
                                            <Icon className={`w-6 h-6 mr-3 flex-shrink-0 ${iconColor}`} />
                                            <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>{quest.title}</span>
                                        </button>
                                    );
                                })
                             )}
                             {/* Display general fetch error for sidebar if needed */}
                            {error && quests.length === 0 && (
                                <p className="text-sm text-red-400 mt-2">Error: {error}</p>
                            )}
                        </div>
                    </div>

                    {/* Quest Details Pane */} 
                    <div className="lg:col-span-8">
                        {isLoading && <QuestDetailsSkeleton />} 
                        {!isLoading && !currentQuest && quests.length > 0 && (
                            <div className="bg-dark-card p-6 rounded-lg text-center text-gray-400">All quests completed in this path!</div>
                        )}
                        {!isLoading && currentQuest && (
                             <div className="bg-dark-card p-6 rounded-lg shadow-lg">
                                <h3 className="text-2xl font-bold text-white mb-1">{currentQuest.title}</h3>
                                <p className="text-sm font-semibold text-yellow-400 mb-4">+{currentQuest.xpReward} XP</p>
                                
                                {/* Learning Content */} 
                                {learningContent?.intro && (
                                    <div className="prose prose-sm prose-invert text-gray-300 max-w-none mb-6 space-y-3">
                                         <h4 className="text-gray-400 font-semibold text-xs uppercase tracking-wider mb-2">Learn More</h4>
                                         <ReactMarkdown components={{ 
                                                a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-solana-purple hover:text-solana-purple-light underline" />,
                                                code: ({node, className, children, ...props}) => {
                                                    const isBlock = node?.tagName === 'code' && 
                                                                    typeof node?.properties?.className === 'string' && 
                                                                    node.properties.className.includes('language-');
                                                    return !isBlock ? (
                                                        <code className={`${className || ''} bg-black/30 rounded px-1 py-0.5 font-mono text-xs`} {...props}>
                                                            {children}
                                                        </code>
                                                    ) : (
                                                        <code className={`${className || ''} bg-black/30 rounded p-1 font-mono text-xs block overflow-x-auto`} {...props}>
                                                            {children}
                                                        </code>
                                                    )
                                                }
                                            }}>
                                            {learningContent.intro}
                                         </ReactMarkdown>
                                    </div>
                                )}
                                
                                {/* Objective & Verification Area */} 
                                 <div className="mt-6 pt-6 border-t border-gray-700/50">
                                     <h4 className="text-gray-400 font-semibold text-xs uppercase tracking-wider mb-3">Objective</h4>

                                     {/* Display currentQuest.description here if it exists */}
                                     {currentQuest.description && (
                                        <div className="prose prose-sm prose-invert text-gray-300 max-w-none mb-4">
                                            <ReactMarkdown components={{ 
                                                a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-solana-purple hover:text-solana-purple-light underline" />,
                                                code: ({node, className, children, ...props}) => {
                                                    const isBlock = node?.tagName === 'code' && 
                                                                    typeof node?.properties?.className === 'string' && 
                                                                    node.properties.className.includes('language-');
                                                    return !isBlock ? (
                                                        <code className={`${className || ''} bg-black/30 rounded px-1 py-0.5 font-mono text-xs`} {...props}>
                                                            {children}
                                                        </code>
                                                    ) : (
                                                        <code className={`${className || ''} bg-black/30 rounded p-1 font-mono text-xs block overflow-x-auto`} {...props}>
                                                            {children}
                                                        </code>
                                                    )
                                                }
                                            }}>
                                                {currentQuest.description}
                                            </ReactMarkdown>
                                        </div>
                                     )}

                                     {/* Display based on verification type */} 
                                      {currentQuest.isCompleted ? (
                                        <div className="flex items-center text-solana-green bg-solana-green/10 border border-solana-green/30 rounded-md p-3">
                                            <CheckCircleIcon className="w-6 h-6 mr-2" />
                                            <span className="text-sm font-medium">Quest Completed!</span>
                                        </div>
                                    ) : (
                                        <> 
                                            {/* Signature Quest (Auto-verified by login) */} 
                                            {currentQuest.verificationType === 'signature' && (
                                                <p className="text-sm text-gray-400 italic">This quest is automatically completed when you verify your wallet by logging in.</p>
                                                // No button needed here as login handles it.
                                            )}

                                            {/* Balance Check Quest */} 
                                             {currentQuest.verificationType === 'balance_check' && (
                                                <button 
                                                    onClick={() => handleVerifyBalance(currentQuest.id)}
                                                    disabled={isVerifying[currentQuest.id]}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-solana-purple hover:bg-solana-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-purple focus:ring-offset-dark-card disabled:opacity-50"
                                                >
                                                    {isVerifying[currentQuest.id] ? (
                                                        <><ArrowPathIcon className="animate-spin w-4 h-4 mr-2"/> Verifying...</> 
                                                    ) : 'Verify Balance'}
                                                </button>
                                            )}

                                             {/* Input Answer Quest */} 
                                            {currentQuest.verificationType === 'input_answer' && (
                                                <div className="space-y-3">
                                                     {/* Render description for input quests here if not included above - THIS PART IS NOW REMOVED */}
                                                    {/* {!learningContent?.intro && currentQuest.description && 
                                                        <div className="prose prose-sm prose-invert text-gray-300 max-w-none">
                                                            <ReactMarkdown components={{ a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-solana-purple hover:text-solana-purple-light underline" /> }}>
                                                                {currentQuest.description}
                                                            </ReactMarkdown>
                                                         </div>
                                                    } */}
                                                    <input 
                                                        type="text"
                                                        value={inputAnswers[currentQuest.id] || ''}
                                                        onChange={(e) => handleInputChange(currentQuest.id, e.target.value)}
                                                        placeholder={`Enter ${currentQuest.title.replace('Find ', '').replace('Explore an ', '')}`} // Dynamic placeholder
                                                        className="w-full px-3 py-2 bg-dark-card-secondary border border-gray-600 rounded-md text-white focus:ring-solana-purple focus:border-solana-purple"
                                                    />
                                                    <button 
                                                        onClick={() => handleVerifyAnswer(currentQuest.id, inputAnswers[currentQuest.id] || '')}
                                                        disabled={isVerifying[currentQuest.id] || !inputAnswers[currentQuest.id]?.trim()}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-solana-green hover:bg-solana-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-green focus:ring-offset-dark-card disabled:opacity-50"
                                                    >
                                                        {isVerifying[currentQuest.id] ? (
                                                            <><ArrowPathIcon className="animate-spin w-4 h-4 mr-2"/> Submitting...</>
                                                        ) : 'Submit Answer'}
                                                    </button>
                                                 </div>
                                            )}
                                            
                                            {/* Community Link Click Quest */} 
                                            {currentQuest.verificationType === 'community_link_click' && currentQuest.actionUrl && currentQuest.actionText && (
                                                <div className="space-y-3">
                                                    <a 
                                                        href={currentQuest.actionUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-200 bg-dark-card-secondary hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-dark-card"
                                                    >
                                                        {currentQuest.actionText} <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
                                                    </a>
                                                    <button 
                                                        onClick={() => handleCommunityConfirm(currentQuest.id)}
                                                        disabled={isVerifying[currentQuest.id]}
                                                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-solana-green hover:bg-solana-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-green focus:ring-offset-dark-card disabled:opacity-50"
                                                    >
                                                         {isVerifying[currentQuest.id] ? (
                                                            <><ArrowPathIcon className="animate-spin w-4 h-4 mr-2"/> Confirming...</>
                                                        ) : (
                                                            <><CheckIcon className="w-4 h-4 mr-1"/> Confirm Action</> 
                                                        )}
                                                    </button>
                                                    <p className="text-xs text-gray-500 pt-1">Click the button above to visit the link, then confirm here.</p>
                                                </div>
                                            )}

                                             {/* Display quest-specific errors */} 
                                             {questActionError[currentQuest.id] && (
                                                <p className="text-sm text-red-400 mt-3">Error: {questActionError[currentQuest.id]}</p>
                                            )}
                                         </>
                                     )}
                                </div>
                            </div>
                        )} 
                    </div>
                </div>
            </div>
        </SkeletonTheme>
    );
} 