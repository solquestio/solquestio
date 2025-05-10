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
const getLearningContent = (questId: string, verificationType?: string): { intro: React.ReactNode; imageUrl?: string } => {
    // Style for green bullet points
    const greenBulletStyle: React.CSSProperties = {
        flexShrink: 0,
        display: 'inline-block',
        width: '8px',
        height: '8px',
        backgroundColor: '#4CAF50', // Green color
        borderRadius: '50%',
        marginRight: '12px',
        marginTop: '7px', // Adjusted for alignment with text
    };
    const paragraphStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: '10px',
        lineHeight: '1.6',
    };
    const textSpanStyle: React.CSSProperties = {
        color: '#D1D5DB', // Tailwind gray-300 for better readability on dark bg
    };

    if (verificationType === 'community_link_click') {
        if (questId.startsWith('visit-x')) {
            return {
                intro: (
                    <div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                Stay connected and informed! Following SolQuest on X (formerly Twitter) is the best way to get the latest news, announcements, and alpha drops.
                            </span>
                        </div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                Your engagement—likes, retweets, and replies—helps boost our visibility and grow our vibrant learning community. Click the link, follow our page, then confirm here!
                            </span>
                        </div>
                    </div>
                )
            };
        }
        if (questId.startsWith('join-discord')) {
            return {
                intro: (
                    <div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                Become an active member of the SolQuest community by joining our official Discord server! It's the central hub for discussions, support, and collaboration.
                            </span>
                        </div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                Connect with fellow SolQuesters, ask questions about quests, share your learning journey, participate in events, and get direct support from the team. We're excited to welcome you!
                            </span>
                        </div>
                    </div>
                )
            };
        }
        // Fallback for other community_link_click quests if any, or remove if not needed
        return { 
            intro: (
                <div>
                    <div style={paragraphStyle}>
                        <span style={greenBulletStyle}></span>
                        <span style={textSpanStyle}>Engage with our community! Click the link and follow the instructions, then confirm completion.</span>
                    </div>
                </div>
            ) 
        };
    }

    switch (questId) {
        case 'verify-wallet':
            return {
                intro: (
                    <div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                Wallet verification is a cornerstone of secure Web3 interactions. This process confirms that you are the true owner of your Solana wallet address.
                            </span>
                        </div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                <strong>How does it work?</strong> Decentralized applications (dApps) like SolQuest will ask you to "sign" a unique, human-readable message. Signing uses your wallet's private key to create a cryptographic signature for that specific message.
                            </span>
                        </div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                This signature proves you possess the private key associated with your public address, without ever revealing the private key itself. It's a secure handshake confirming your identity on the blockchain. Completing this step is fundamental for most dApp interactions.
                            </span>
                        </div>
                    </div>
                ),
            };
        case 'fund-wallet':
            return {
                intro: (
                    <div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                SOL is the lifeblood of the Solana blockchain. It's the native cryptocurrency used for all on-chain activities.
                            </span>
                        </div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                <strong>Key Uses of SOL:</strong>
                                <ul style={{ listStyleType: 'disc', marginLeft: '20px', marginTop: '5px' }}>
                                    <li><strong>Transaction Fees:</strong> Every action, like sending tokens, minting NFTs, or interacting with smart contracts (programs), requires a small SOL fee.</li>
                                    <li><strong>Staking:</strong> You can stake SOL to help secure the network and earn rewards.</li>
                                </ul>
                            </span>
                        </div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                For this learning path (and most development on Solana), you'll use Devnet SOL, which is free test currency. This quest ensures you have a small amount (e.g., at least 0.01 Devnet SOL) to cover transaction costs for subsequent quests. You can acquire Devnet SOL from a "faucet" – a service that dispenses free test tokens.
                            </span>
                        </div>
                    </div>
                ),
            };
        case 'explore-transaction-1':
            return {
                intro: (
                    <div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                Welcome to the Solana Explorer Path! Block explorers are your window into the blockchain, offering transparency and insight into all on-chain activity.
                            </span>
                        </div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                <strong>What are you exploring?</strong> In this quest, you'll examine a Solana transaction to understand its components. You'll look at details like signatures, signers, block information, and program logs.
                            </span>
                        </div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                <strong>Compute Units (CUs):</strong> A key concept on Solana is Compute Units. These measure the computational resources a transaction consumes. Developers aim to minimize CU usage to make their applications efficient and keep transaction fees low for users. Understanding CUs is vital for optimizing Solana programs.
                            </span>
                        </div>
                    </div>
                ),
            };
        case 'find-nft-authority-1':
            return {
                intro: (
                    <div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                Non-Fungible Tokens (NFTs) on Solana often have a hierarchical structure, particularly when they are part of a collection.
                            </span>
                        </div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                <strong>The Update Authority:</strong> This is a critical address associated with an NFT or, more commonly, an entire NFT collection. The wallet holding the Update Authority has special privileges, typically including the ability to modify the metadata of the NFT(s) it governs. Metadata includes attributes like the NFT's name, image URL, and other traits.
                            </span>
                        </div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                Identifying the Update Authority using a block explorer is a crucial step in verifying an NFT's authenticity and understanding who controls its fundamental properties. This helps protect against counterfeit collections and ensures the NFT's provenance.
                            </span>
                        </div>
                    </div>
                ),
            };
        case 'find-first-tx-1':
            return {
                intro: (
                    <div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                The Solana blockchain maintains an immutable and transparent ledger of all transactions. This means every interaction with a wallet address is permanently recorded and publicly viewable.
                            </span>
                        </div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                <strong>Tracing Account History:</strong> Using a block explorer, you can delve into the complete history of any Solana account. This includes all incoming and outgoing transactions, token transfers, program interactions, and more.
                            </span>
                        </div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                In this quest, you'll learn to navigate this history to find the very first transaction associated with a given wallet address. This skill is useful for understanding an account's origin, its initial funding, or its first interaction with the Solana network.
                            </span>
                        </div>
                    </div>
                ),
            };
        case 'mint-og-nft':
            return {
                intro: (
                    <div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                Minting an NFT (Non-Fungible Token) is the process of creating and registering a unique digital asset on the blockchain. This makes you its first official owner.
                            </span>
                        </div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                <strong>The SolQuest OG NFT:</strong> This special NFT signifies your status as an early supporter and valued member of the SolQuest community. Holding it may unlock future benefits, like XP boosts or early access to new content.
                            </span>
                        </div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                This quest guides you through the practical steps of minting. The transaction you approve will permanently record your ownership of this unique digital collectible on the Solana blockchain.
                            </span>
                        </div>
                    </div>
                ),
            };
        case 'refer-friend-og':
            return {
                intro: (
                    <div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                Web3 is built on community and network effects. Growing the SolQuest ecosystem means more learners, more content, and a richer experience for everyone.
                            </span>
                        </div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                <strong>Share the Knowledge:</strong> This quest encourages you to invite friends to join SolQuest. When they sign up or complete a certain action using your referral, it helps our community grow.
                            </span>
                        </div>
                        <div style={paragraphStyle}>
                            <span style={greenBulletStyle}></span>
                            <span style={textSpanStyle}>
                                This often involves sharing a unique referral link or code. It's a way to foster shared discovery and reward community participation. Let's build SolQuest together!
                            </span>
                        </div>
                    </div>
                ),
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
                                         {(() => {
                                            const introContent = learningContent.intro;
                                            if (typeof introContent === 'string') {
                                                return (
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
                                                        {introContent}
                                                    </ReactMarkdown>
                                                );
                                            } else {
                                                // Directly render if it's already a ReactNode (JSX)
                                                return introContent;
                                            }
                                         })()}
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