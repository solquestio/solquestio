'use client';
import React from 'react';
import Link from 'next/link';

interface QuestTypeCardProps {
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  audience: string;
  benefits: string[];
  questCount: number;
  icon: React.ReactNode;
}

const QuestTypeCard: React.FC<QuestTypeCardProps> = ({
  title,
  difficulty,
  description,
  audience,
  benefits,
  questCount,
  icon
}) => {
  const colors = {
    beginner: {
      bg: 'bg-emerald-900/20',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      button: 'bg-emerald-600 hover:bg-emerald-700'
    },
    intermediate: {
      bg: 'bg-blue-900/20',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    advanced: {
      bg: 'bg-purple-900/20',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      button: 'bg-purple-600 hover:bg-purple-700'
    }
  };

  return (
    <div className={`rounded-xl ${colors[difficulty].bg} border ${colors[difficulty].border} overflow-hidden`}>
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className={`p-2 rounded-lg ${colors[difficulty].text} bg-gray-800`}>
            {icon}
          </div>
          <h3 className="text-xl font-bold ml-3 text-white">{title}</h3>
        </div>
        
        <p className="text-gray-300 mb-4">{description}</p>
        
        <div className="mb-4">
          <h4 className={`text-sm font-medium mb-2 ${colors[difficulty].text}`}>Ideal for:</h4>
          <p className="text-gray-400 text-sm">{audience}</p>
        </div>
        
        <div className="mb-4">
          <h4 className={`text-sm font-medium mb-2 ${colors[difficulty].text}`}>Benefits:</h4>
          <ul className="space-y-1">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-start text-sm text-gray-400">
                <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 mr-2 ${colors[difficulty].text}`}></span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex justify-between items-center mt-6">
          <span className="text-sm text-gray-400">{questCount} quests</span>
          <Link href={`/paths/substreams?path=${difficulty}`} className={`px-4 py-2 rounded text-white text-sm ${colors[difficulty].button}`}>
            Start Path
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function SubstreamsQuestTypes() {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-white mb-6">Choose Your Learning Path</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        <QuestTypeCard
          title="Explorer Path"
          difficulty="beginner"
          description="A visual journey through Substreams concepts with interactive demos and simple challenges."
          audience="Newcomers to blockchain data and The Graph ecosystem with no coding experience required."
          benefits={[
            "Learn core concepts through visualizations",
            "Understand data flow in blockchain indexing",
            "Build confidence before diving into code",
            "Earn XP through quizzes and interactive challenges"
          ]}
          questCount={4}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
        
        <QuestTypeCard
          title="Developer Path"
          difficulty="intermediate"
          description="Hands-on coding challenges to build and deploy your own Substreams modules for Solana data."
          audience="Developers with some blockchain experience who want to build data indexing solutions."
          benefits={[
            "Create real Substreams modules in Rust",
            "Extract and transform Solana token transfers",
            "Deploy your modules to production",
            "Build a complete data indexing pipeline"
          ]}
          questCount={4}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          }
        />
        
        <QuestTypeCard
          title="Expert Path"
          difficulty="advanced"
          description="Advanced techniques for building complex, production-grade Substreams for sophisticated data applications."
          audience="Experienced blockchain developers and data engineers seeking cutting-edge indexing solutions."
          benefits={[
            "Build complex entity relationships",
            "Create cross-chain indexing solutions",
            "Integrate AI for smart data processing",
            "Prepare for hackathons and production deployments"
          ]}
          questCount={4}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
      </div>
      
      <div className="mt-12 p-6 rounded-lg border border-gray-700 bg-gray-800/50">
        <h3 className="text-lg font-medium text-white mb-3">Not Sure Where to Start?</h3>
        <p className="text-gray-400 mb-4">
          If you're new to blockchain data or Substreams, we recommend beginning with the Explorer Path. 
          You can always switch paths later or try challenges from different paths.
        </p>
        <Link href="/paths/substreams/intro" className="text-blue-400 hover:text-blue-300 text-sm">
          Take the quick assessment quiz →
        </Link>
      </div>
    </div>
  );
} 