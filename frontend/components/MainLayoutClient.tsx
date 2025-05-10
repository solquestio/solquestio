'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { HeaderWalletButton } from '@/components/HeaderWalletButton';
import { AuthPromptModal } from '@/components/AuthPromptModal';
import { useWallet, WalletNotSelectedError } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import bs58 from 'bs58';

const AUTH_TOKEN_KEY = 'solquest_auth_token';
// Hardcode API URL temporarily for testing
const BACKEND_URL = 'https://api.solquest.io';
const SIGN_IN_MESSAGE = "Sign this message to verify your wallet and log in to SolQuest.io. This does not cost any SOL.";

interface MainLayoutClientProps {
    children: React.ReactNode;
}

export default function MainLayoutClient({ children }: MainLayoutClientProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const { publicKey, signMessage, connected, wallet } = useWallet();
    const { setVisible: setWalletModalVisible } = useWalletModal();

    useEffect(() => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        setIsAuthenticated(!!token);
        
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === AUTH_TOKEN_KEY) {
                setIsAuthenticated(!!event.newValue);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleRequestAuthentication = useCallback(async () => {
        setAuthError(null);
        setIsAuthLoading(true);

        if (!connected) {
            setWalletModalVisible(true);
            setIsAuthLoading(false);
            return;
        }
        if (!publicKey) {
            // Function to handle wallet connection and authentication
            const connectWallet = async () => {
                console.log('Connecting wallet...', 'API URL:', BACKEND_URL);
                if (!wallet) return; // Safety check

                try {
                    setIsAuthLoading(true);
                    setAuthError(null);

                    // 1. Generate message for signing
                    const messageToSign = SIGN_IN_MESSAGE;
                    const messageBytes = new TextEncoder().encode(messageToSign);
                    
                    // 2. Request signature from wallet
                    if (!publicKey) {
                        console.error('No public key available');
                        throw new Error('No public key available');
                    }
                    
                    const signedMessageBytes = await signMessage(messageBytes);
                    const signature = bs58.encode(signedMessageBytes);
                    
                    // 3. Prepare request to backend for verification
                    const requestBody = {
                        walletAddress: publicKey.toBase58(),
                        signature: signature,
                        message: messageToSign,
                    };
                    
                    console.log('Sending auth request to:', `${BACKEND_URL}/auth/verify`);
                    console.log('Request payload:', JSON.stringify(requestBody));

                    // 4. Send verification request to backend
                    const response = await fetch(`${BACKEND_URL}/auth/verify`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(requestBody),
                        mode: 'cors',
                        credentials: 'include'
                    });

                    console.log('Auth response status:', response.status);
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Auth error response:', errorText);
                        let errorMessage = 'Authentication failed';
                        try {
                            const errorData = JSON.parse(errorText);
                            errorMessage = errorData.message || `Authentication failed (status: ${response.status})`;
                        } catch (e) {
                            errorMessage = `Auth error (${response.status}): ${errorText.substring(0, 100)}`;
                        }
                        throw new Error(errorMessage);
                    }

                    // 5. Handle successful authentication
                    const responseText = await response.text();
                    console.log('Auth success response text:', responseText);
                    
                    let data;
                    try {
                        data = JSON.parse(responseText);
                        console.log('Auth success data:', data);
                    } catch (e) {
                        console.error('Failed to parse auth response as JSON:', e);
                        throw new Error('Invalid response format from server');
                    }
                    
                    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
                    setIsAuthenticated(true);
                    setIsAuthModalOpen(false); 
                    setAuthError(null); 
                } catch (error: any) {
                    let errorMessage = "An unexpected error occurred during sign-in.";
                    if (error.message && (error.message.toLowerCase().includes('user rejected') || error.message.toLowerCase().includes('cancelled') || error.message.toLowerCase().includes('declined'))) {
                        errorMessage = "Sign message request was cancelled or rejected.";
                    } else if (error.message) {
                        errorMessage = error.message;
                    }
                    setAuthError(errorMessage);
                    setIsAuthenticated(false);
                    localStorage.removeItem(AUTH_TOKEN_KEY);
                } finally {
                    setIsAuthLoading(false);
                }
            };
            await connectWallet();
        } else if (!signMessage) {
            setAuthError('The selected wallet does not support message signing.');
            setIsAuthLoading(false);
            return;
        }

        try {
            if (!signMessage || !publicKey) {
                throw new Error('Wallet not properly connected');
            }
            
            const messageToSign = SIGN_IN_MESSAGE;
            const messageBytes = new TextEncoder().encode(messageToSign);
            const signatureBytes = await signMessage(messageBytes);
            const signature = bs58.encode(signatureBytes);

            const requestBody = {
                walletAddress: publicKey.toBase58(),
                signature,
                message: messageToSign,
            };

            console.log('Sending auth request to:', `${BACKEND_URL}/auth/verify`);
            console.log('Request payload:', JSON.stringify(requestBody));
            
            const response = await fetch(`${BACKEND_URL}/auth/verify`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody),
                mode: 'cors',
                credentials: 'omit' // Don't send credentials for now
            });
            
            console.log('Auth response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Authentication failed (status: ${response.status})`);
            }

            const { token } = await response.json();
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            setIsAuthenticated(true);
            setIsAuthModalOpen(false); 
            setAuthError(null); 
        } catch (error: any) {
            let errorMessage = "An unexpected error occurred during sign-in.";
            if (error.message && (error.message.toLowerCase().includes('user rejected') || error.message.toLowerCase().includes('cancelled') || error.message.toLowerCase().includes('declined'))) {
                errorMessage = "Sign message request was cancelled or rejected.";
            } else if (error.message) {
                errorMessage = error.message;
            }
            setAuthError(errorMessage);
            setIsAuthenticated(false);
            localStorage.removeItem(AUTH_TOKEN_KEY);
        } finally {
            setIsAuthLoading(false);
        }
    }, [publicKey, signMessage, connected, setWalletModalVisible]);

    const openLoginModal = () => {
        setAuthError(null);
        setIsAuthModalOpen(true);
    };

    return (
        <div className="relative z-10 flex flex-col min-h-screen">
            <header className="py-4 px-6 bg-dark-card/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-20">
              <nav className="flex justify-between items-center max-w-6xl mx-auto">
                <Link href="/" className="flex items-center">
                  <Logo iconHeight={40}/>
                </Link>
                <div className="flex items-center space-x-6">
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
                  {isAuthenticated ? (
                    <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">Profile</Link>
                  ) : (
                    <button onClick={openLoginModal} className="text-gray-300 hover:text-white transition-colors">Login</button>
                  )}
                  <Link href="/leaderboard" className="text-gray-300 hover:text-white transition-colors">Leaderboard</Link>
                  <HeaderWalletButton />
                </div>
              </nav>
            </header>
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <AuthPromptModal 
                isOpen={isAuthModalOpen}
                onClose={() => {
                    setIsAuthModalOpen(false);
                    setAuthError(null); 
                    // Modal closed
                }}
                onAuthenticate={handleRequestAuthentication}
                loading={isAuthLoading}
                // Referral functionality removed
            />
        </div>
    );
} 