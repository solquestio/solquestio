'use client';
import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface WormholeQuestPageProps {
  params: { questId: string };
}

const questContent: Record<string, { title: string; description: string; content: React.ReactNode }> = {
  'intro': {
    title: 'Introduction to Wormhole',
    description: 'Learn the basics of Wormhole, its architecture, and how it enables multichain interoperability.',
    content: (
      <>
        <p className="mb-4">
          <b>Wormhole</b> is a leading interoperability protocol that connects multiple blockchains, enabling seamless cross-chain messaging, token transfers, and more. It powers some of the most popular multichain dApps in the ecosystem.
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Connects Solana, Ethereum, Polygon, BNB Chain, and more</li>
          <li>Supports token bridging, NFT transfers, and arbitrary messaging</li>
          <li>Secured by a decentralized network of guardians</li>
        </ul>
        <p>Learn more: <a href="https://wormhole.com/docs/" target="_blank" className="text-blue-600 underline">Wormhole Documentation</a></p>
      </>
    )
  },
  'setup': {
    title: 'Setting Up Your Development Environment',
    description: 'Get your tools ready for building with Wormhole. Install dependencies and configure your environment.',
    content: (
      <>
        <ol className="list-decimal ml-6 mb-4">
          <li>Install <b>Node.js</b> (v16+ recommended)</li>
          <li>Clone the <a href="https://github.com/wormhole-foundation/wormhole" target="_blank" className="text-blue-600 underline">Wormhole repo</a> or your SolQuest fork</li>
          <li>Install dependencies: <code className="bg-gray-100 px-2 py-1 rounded">npm install</code></li>
          <li>Get testnet tokens from a faucet (e.g., Solana, Ethereum Goerli)</li>
        </ol>
        <p>For frontend integration, check out <a href="https://github.com/wormhole-foundation/wormhole-connect" target="_blank" className="text-blue-600 underline">Wormhole Connect</a>.</p>
      </>
    )
  },
  'first-transfer': {
    title: 'Building Your First Cross-Chain Transfer',
    description: 'Follow a step-by-step guide to send assets or messages across chains using Wormhole.',
    content: (
      <>
        <ol className="list-decimal ml-6 mb-4">
          <li>Choose source and target chains (e.g., Solana → Ethereum)</li>
          <li>Use Wormhole SDK or Connect widget to initiate a transfer</li>
          <li>Sign and submit the transaction</li>
          <li>Track the transfer on <a href="https://wormholescan.io/" target="_blank" className="text-blue-600 underline">WormholeScan</a></li>
        </ol>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto mb-2">{`// Example: Using Wormhole Connect React widget
import { WormholeConnect } from '@wormhole-foundation/wormhole-connect';

<WormholeConnect />`}</pre>
        <p>See the <a href="https://wormhole.com/docs/build/" target="_blank" className="text-blue-600 underline">Wormhole Build Docs</a> for more code examples.</p>
      </>
    )
  },
  'connect': {
    title: 'Integrating Wormhole Connect',
    description: 'Add Wormhole Connect to your dApp for seamless user experience in cross-chain transfers.',
    content: (
      <>
        <p className="mb-4">Wormhole Connect is a plug-and-play React component for cross-chain transfers. To add it to your dApp:</p>
        <ol className="list-decimal ml-6 mb-4">
          <li>Install the package: <code className="bg-gray-100 px-2 py-1 rounded">npm install @wormhole-foundation/wormhole-connect</code></li>
          <li>Import and use the component in your page:</li>
        </ol>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto mb-2">{`import { WormholeConnect } from '@wormhole-foundation/wormhole-connect';

export default function MyPage() {
  return <WormholeConnect />;
}`}</pre>
        <p>Customize the widget as needed. <a href="https://wormhole.com/docs/build/connect/" target="_blank" className="text-blue-600 underline">See Connect Docs</a>.</p>
      </>
    )
  },
  'verify': {
    title: 'Submitting and Verifying Cross-Chain Transactions',
    description: 'Learn how to submit, track, and verify cross-chain transactions using WormholeScan.',
    content: null,
  },
  'capstone': {
    title: 'Capstone: Launch a Multichain Quest',
    description: 'Apply everything you have learned to launch a real multichain quest using Wormhole.',
    content: (
      <>
        <p className="mb-4">For your capstone, design and deploy a quest that requires users to complete a cross-chain action using Wormhole. Ideas:</p>
        <ul className="list-disc ml-6 mb-4">
          <li>Bridge tokens from Solana to another chain and claim a reward</li>
          <li>Submit a WormholeScan TX hash as proof of completion</li>
          <li>Integrate Wormhole Connect for a seamless user experience</li>
        </ul>
        <p>Share your quest and results with the community!</p>
      </>
    )
  }
};

const WormholeQuestPage: React.FC<WormholeQuestPageProps> = ({ params }) => {
  const { userProfile } = useAuth();
  const [txHash, setTxHash] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>("idle");
  const [message, setMessage] = useState('');
  const quest = questContent[params.questId] || {
    title: 'Quest Not Found',
    description: 'The quest you are looking for does not exist.',
    content: null
  };

  // Custom content for the 'verify' quest
  const renderVerifyContent = () => (
    <>
      <ol className="list-decimal ml-6 mb-4">
        <li>After sending a cross-chain transfer, copy the transaction hash</li>
        <li>Go to <a href="https://wormholescan.io/" target="_blank" className="text-blue-600 underline">WormholeScan</a> and search for your TX</li>
        <li>Verify the status and details of your transfer</li>
        <li>Submit the TX hash in the quest completion form below</li>
      </ol>
      <form className="mb-4" onSubmit={async (e) => {
        e.preventDefault();
        if (!userProfile) {
          setStatus('error');
          setMessage('You must be logged in to submit your TX hash.');
          return;
        }
        setStatus('loading');
        setMessage('');
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quests/wormhole/verify-tx`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userProfile.id,
              questId: 'verify',
              txHash,
            }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setStatus('success');
            setMessage('Quest completed! XP awarded: ' + data.xp);
          } else {
            setStatus('error');
            setMessage(data.error || 'Submission failed.');
          }
        } catch (err: any) {
          setStatus('error');
          setMessage('Submission failed: ' + err.message);
        }
      }}>
        <label htmlFor="txHash" className="block mb-2 font-semibold">Wormhole TX Hash:</label>
        <input id="txHash" name="txHash" type="text" className="border px-2 py-1 rounded w-full mb-2" placeholder="Paste your transaction hash here" value={txHash} onChange={e => setTxHash(e.target.value)} />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={status === 'loading'}>
          {status === 'loading' ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      {status === 'success' && <div className="text-green-600 font-semibold mb-2">{message}</div>}
      {status === 'error' && <div className="text-red-600 font-semibold mb-2">{message}</div>}
    </>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{quest.title}</h1>
      <p className="mb-6 text-lg">{quest.description}</p>
      {params.questId === 'verify' ? renderVerifyContent() : quest.content}
      <div className="mt-8">
        <Link href="/paths/wormhole" className="text-blue-600 hover:underline">← Back to Wormhole Path</Link>
      </div>
    </div>
  );
};

export default WormholeQuestPage; 