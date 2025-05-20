'use client';

import React from 'react';
import { DemoPathTemplate, PlaceholderQuestComponent } from '@/lib/DemoPathTemplate';
import { IntroToZeusBtcQuest } from '@/components/quests/bitcoin-solana/IntroToZeusBtcQuest';
import { ApolloExchangeQuest } from '@/components/quests/bitcoin-solana/ApolloExchangeQuest';
import { ZeusProgramLibraryQuest } from '@/components/quests/bitcoin-solana/ZeusProgramLibraryQuest';
import { MintingManagingZbtcQuest } from '@/components/quests/bitcoin-solana/MintingManagingZbtcQuest';

const BitcoinSolanaLearningPathPage = () => {
  const PATH_KEY = 'bitcoinSolana';
  
  // Define quests with their XP values
  const getQuestsList = (completedQuests: Record<string, boolean>) => [
    {
      id: 'btcsol-q1-intro',
      title: '1. Introduction to Zeus Network & zBTC',
      description: 'Learn about the Zeus Network ecosystem and how it enables Bitcoin interoperability on Solana through zBTC.',
      component: IntroToZeusBtcQuest,
      xp: 200,
      props: { title: 'Introduction to Zeus Network & zBTC' },
      isComplete: !!completedQuests['btcsol-q1-intro']
    },
    {
      id: 'btcsol-q2-apollo',
      title: '2. Understanding APOLLO: The Bitcoin On-Chain Exchange',
      description: 'Explore how APOLLO works to bridge Bitcoin and Solana, enabling seamless movement of BTC to zBTC and back.',
      component: ApolloExchangeQuest,
      xp: 250,
      props: { title: 'Understanding APOLLO: The Bitcoin On-Chain Exchange' },
      isComplete: !!completedQuests['btcsol-q2-apollo']
    },
    {
      id: 'btcsol-q3-zpl',
      title: '3. Building with Zeus Program Library (ZPL)',
      description: 'Learn the fundamentals of the Zeus Program Library SDK and how to integrate it into your Solana applications.',
      component: ZeusProgramLibraryQuest,
      xp: 300,
      props: { title: 'Building with Zeus Program Library (ZPL)' },
      isComplete: !!completedQuests['btcsol-q3-zpl']
    },
    {
      id: 'btcsol-q4-minting',
      title: '4. Minting and Managing zBTC',
      description: 'Create a simple application to mint, transfer, and manage zBTC tokens within the Solana ecosystem.',
      component: MintingManagingZbtcQuest,
      xp: 350,
      props: { title: 'Minting and Managing zBTC' },
      isComplete: !!completedQuests['btcsol-q4-minting']
    },
    {
      id: 'btcsol-q5-defi',
      title: '5. zBTC in DeFi Applications',
      description: 'Explore how to integrate zBTC into DeFi applications like lending platforms, yield farming, and more.',
      component: PlaceholderQuestComponent,
      xp: 400,
      props: { title: 'zBTC in DeFi Applications', xpReward: 400 },
      isComplete: !!completedQuests['btcsol-q5-defi']
    },
    {
      id: 'btcsol-q6-stablecoins',
      title: '6. Creating Bitcoin-Backed Stablecoins',
      description: 'Learn to develop stablecoin solutions backed by zBTC and understand the economic principles behind them.',
      component: PlaceholderQuestComponent,
      xp: 450,
      props: { title: 'Creating Bitcoin-Backed Stablecoins', xpReward: 450 },
      isComplete: !!completedQuests['btcsol-q6-stablecoins']
    },
    {
      id: 'btcsol-q7-capstone',
      title: '7. Capstone: Build a zBTC-Powered Application',
      description: 'Build a complete application that utilizes zBTC in an innovative way, incorporating the Zeus Network infrastructure.',
      component: PlaceholderQuestComponent,
      xp: 500,
      props: { title: 'Capstone: Build a zBTC-Powered Application', xpReward: 500 },
      isComplete: !!completedQuests['btcsol-q7-capstone']
    }
  ];

  return (
    <DemoPathTemplate
      pathKey={PATH_KEY}
      pathTitle="Bitcoin on Solana with Zeus Network"
      defaultQuestId="btcsol-q1-intro"
      quests={getQuestsList}
    />
  );
};

export default BitcoinSolanaLearningPathPage; 