import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Box, Button, Text, VStack, HStack, Link, Spinner, Badge, useToast } from '@chakra-ui/react';
import { ArrowForwardIcon, CheckCircleIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import Image from 'next/image';

// This should be replaced with the actual NFT collection address once deployed on Magic Eden
const NFT_COLLECTION_ADDRESS = "2rCAH2DF3UbBnRM9atpkQT7eVy9V5B9oXMYzziV8tyGv"; // Example collection address
const MAGIC_EDEN_COLLECTION_URL = "https://magiceden.io/collections/solquestio-og-nft"; // Replace with actual URL

const NFTVerificationQuest = ({ onComplete }: { onComplete: () => void }) => {
  const { publicKey, connected } = useWallet();
  const [hasNFT, setHasNFT] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const toast = useToast();

  // Check if the wallet owns an NFT from our collection
  const checkNFTOwnership = async () => {
    if (!publicKey) return;
    
    setIsLoading(true);
    try {
      // In production, you would use the Metaplex SDK to fetch NFTs owned by this wallet
      // and filter by your collection address
      
      // For demo/development purposes, we can use this approach:
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com");
      
      // Simulate checking NFT ownership (in production replace with actual API call)
      // This would typically use the Metaplex SDK or a backend API that checks the blockchain
      
      // Example pseudo-code for production:
      // const nfts = await metaplex.nfts().findAllByOwner({ owner: publicKey });
      // const hasCollectionNFT = nfts.some(nft => nft.collection?.address.toString() === NFT_COLLECTION_ADDRESS);
      
      // For demo, we'll use localStorage to simulate verification state
      const hasStoredNFT = localStorage.getItem(`has_solquestio_nft_${publicKey.toString()}`);
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setHasNFT(!!hasStoredNFT);
      
      // If the user has the NFT, we can mark the quest as complete
      if (!!hasStoredNFT && !verified) {
        setVerified(true);
        onComplete();
        toast({
          title: "NFT Verified!",
          description: "Your SolQuestio OG NFT has been verified successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error checking NFT ownership:", error);
      toast({
        title: "Verification Error",
        description: "Failed to verify NFT ownership. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // For demo purposes - simulate having the NFT
  const simulateHavingNFT = () => {
    if (publicKey) {
      localStorage.setItem(`has_solquestio_nft_${publicKey.toString()}`, 'true');
      checkNFTOwnership();
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      checkNFTOwnership();
    }
  }, [connected, publicKey]);

  return (
    <VStack spacing={4} align="stretch" p={6} bg="gray.800" borderRadius="lg" boxShadow="md">
      <Text fontSize="xl" fontWeight="bold">SolQuestio OG NFT Verification</Text>
      
      <Box position="relative" borderRadius="lg" overflow="hidden" height="200px">
        <Image 
          src="/images/nft/og-nft-preview.jpg" 
          alt="SolQuestio OG NFT" 
          layout="fill" 
          objectFit="cover"
        />
        <Box 
          position="absolute" 
          bottom={0} 
          left={0} 
          right={0} 
          bg="blackAlpha.700" 
          p={2}
          textAlign="center"
        >
          <Text fontWeight="bold">SolQuestio OG NFT Collection</Text>
        </Box>
      </Box>
      
      {!connected ? (
        <Text color="yellow.300">Connect your wallet to verify your NFT ownership</Text>
      ) : hasNFT ? (
        <VStack spacing={3} align="stretch">
          <HStack bg="green.800" p={3} borderRadius="md">
            <CheckCircleIcon color="green.300" />
            <Text color="green.300">NFT Verified! Quest completed.</Text>
          </HStack>
          
          <Button 
            rightIcon={<ExternalLinkIcon />} 
            colorScheme="purple" 
            onClick={() => window.open("/profile", "_blank")}
          >
            View in Profile
          </Button>
        </VStack>
      ) : (
        <VStack spacing={4} align="stretch">
          <Text>
            You need to own a SolQuestio OG NFT to complete this quest. Mint one on Magic Eden to continue.
          </Text>
          
          <HStack justify="space-between">
            <Badge colorScheme="purple" p={1} borderRadius="md">Limited Collection: 10,000 NFTs</Badge>
            <Badge colorScheme="blue" p={1} borderRadius="md">Price: 0.005 SOL</Badge>
          </HStack>
          
          <Button
            as="a"
            href={MAGIC_EDEN_COLLECTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            colorScheme="purple"
            rightIcon={<ExternalLinkIcon />}
          >
            Mint on Magic Eden
          </Button>
          
          {isLoading ? (
            <Button isLoading loadingText="Verifying..." disabled />
          ) : (
            <Button 
              onClick={checkNFTOwnership} 
              rightIcon={<ArrowForwardIcon />}
              variant="outline"
            >
              I already have the NFT - Verify Now
            </Button>
          )}
          
          {/* For development/demo only - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <Button 
              onClick={simulateHavingNFT} 
              size="sm" 
              colorScheme="gray" 
              variant="ghost"
            >
              (Demo Only) Simulate Having NFT
            </Button>
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default NFTVerificationQuest; 