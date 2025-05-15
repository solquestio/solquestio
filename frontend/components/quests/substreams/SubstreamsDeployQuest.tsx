'use client';
import React, { useState } from 'react';

interface SubstreamsDeployQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const SubstreamsDeployQuest: React.FC<SubstreamsDeployQuestProps> = ({ onQuestComplete, xpReward }) => {
  const [checkboxes, setCheckboxes] = useState({
    packageCreated: false,
    registryAccountCreated: false,
    packagePushed: false,
    packageTested: false,
    documentationAdded: false
  });
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleCheckboxChange = (checkbox: keyof typeof checkboxes) => {
    setCheckboxes(prev => ({
      ...prev,
      [checkbox]: !prev[checkbox]
    }));
  };

  const allCheckboxesChecked = Object.values(checkboxes).every(val => val === true);

  const handleCompleteClick = () => {
    if (allCheckboxesChecked) {
      setIsCompleted(true);
      onQuestComplete();
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-1">Deploying Substreams</h3>
      {xpReward !== undefined && (
        <p className="text-sm font-semibold text-yellow-400 mb-4">
          +{xpReward} XP
        </p>
      )}
      
      <div className="text-gray-400 mb-6 space-y-3">
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            Once you've created your Substreams package, it's time to deploy it so that others can use it. This quest will guide you through the deployment process.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>What you'll learn:</strong> How to package, test, and publish your Substreams for public use, particularly on substreams.dev.
          </span>
        </p>
      </div>

      {!isCompleted ? (
        <div className="space-y-6">
          <div className="bg-dark-card-secondary rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Packaging Your Substreams</h4>
            
            <div className="space-y-4">
              <p className="text-gray-300">
                Before deployment, you need to package your Substreams into a deployable <code className="bg-gray-700 px-1 rounded-sm text-emerald-400">.spkg</code> file:
              </p>
              
              <div className="bg-gray-800 p-4 rounded-md text-sm font-mono text-gray-300">
                <p># Build your Substreams code</p>
                <p>cargo build --release --target wasm32-unknown-unknown</p>
                <p></p>
                <p># Package it into an .spkg file</p>
                <p>substreams pack</p>
              </div>
              
              <p className="text-gray-300">
                This creates a file like <code className="bg-gray-700 px-1 rounded-sm text-emerald-400">your-project-v0.1.0.spkg</code> in your current directory.
              </p>
              
              <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-md">
                <h5 className="text-emerald-400 font-medium mb-2">Package Versioning</h5>
                <p className="text-gray-300 text-sm">
                  The version in your <code className="bg-gray-700 px-1 rounded-sm text-emerald-400">substreams.yaml</code> (e.g., <code className="bg-gray-700 px-1 rounded-sm text-emerald-400">v0.1.0</code>) will be part of your package name. For each change, increment this version following semantic versioning principles.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-card-secondary rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Testing Your Package Locally</h4>
            
            <div className="space-y-4">
              <p className="text-gray-300">
                Before publishing, test your Substreams package to ensure it works correctly:
              </p>
              
              <div className="bg-gray-800 p-4 rounded-md text-sm font-mono text-gray-300">
                <p># Test running your package</p>
                <p>substreams run -e solana.substreams.dev:443 \</p>
                <p>  ./your-project-v0.1.0.spkg \</p>
                <p>  map_module_name \</p>
                <p>  --start-block 200000000 \</p>
                <p>  --stop-block +10</p>
              </div>
              
              <p className="text-gray-300">
                This command runs your Substreams against 10 blocks from block 200,000,000. Check the output to ensure your module is processing data correctly.
              </p>
            </div>
          </div>
          
          <div className="bg-dark-card-secondary rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Publishing to Substreams Registry</h4>
            
            <div className="space-y-4">
              <p className="text-gray-300">
                To publish your Substreams for public use, follow these steps:
              </p>
              
              <ol className="space-y-6 text-gray-300">
                <li className="space-y-2">
                  <h5 className="font-medium text-white">1. Create an account on substreams.dev</h5>
                  <p>
                    Visit <a href="https://substreams.dev" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">substreams.dev</a> and create an account if you haven't already.
                  </p>
                </li>
                
                <li className="space-y-2">
                  <h5 className="font-medium text-white">2. Push your package to the registry</h5>
                  <div className="bg-gray-800 p-4 rounded-md text-sm font-mono text-gray-300">
                    <p># Authenticate with the registry</p>
                    <p>substreams auth login</p>
                    <p></p>
                    <p># Push your package</p>
                    <p>substreams publish your-project-v0.1.0.spkg</p>
                  </div>
                </li>
                
                <li className="space-y-2">
                  <h5 className="font-medium text-white">3. Create documentation</h5>
                  <p>
                    Good documentation is crucial for others to understand and use your Substreams. Create a README.md file that includes:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Overview of what your Substreams does</li>
                    <li>Modules it contains and their purposes</li>
                    <li>Input and output data formats</li>
                    <li>Usage examples</li>
                    <li>Dependencies on other packages</li>
                  </ul>
                </li>
                
                <li className="space-y-2">
                  <h5 className="font-medium text-white">4. Share your Substreams URL</h5>
                  <p>
                    After publishing, you can share your Substreams with others using the URL format:
                  </p>
                  <div className="bg-gray-800 p-2 rounded-md text-sm font-mono text-gray-300">
                    <p>substreams://username/package-name/version</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
          
          <div className="bg-dark-card-secondary rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Completion Checklist</h4>
            <p className="text-gray-300 mb-4">
              Mark each step as you complete it to finish this quest:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="packageCreated"
                  checked={checkboxes.packageCreated}
                  onChange={() => handleCheckboxChange('packageCreated')}
                  className="w-4 h-4 text-emerald-500 rounded border-gray-600 focus:ring-emerald-500 bg-gray-700"
                />
                <label htmlFor="packageCreated" className="ml-2 text-gray-300">
                  I've created a Substreams package (.spkg) file
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="registryAccountCreated"
                  checked={checkboxes.registryAccountCreated}
                  onChange={() => handleCheckboxChange('registryAccountCreated')}
                  className="w-4 h-4 text-emerald-500 rounded border-gray-600 focus:ring-emerald-500 bg-gray-700"
                />
                <label htmlFor="registryAccountCreated" className="ml-2 text-gray-300">
                  I've created an account on substreams.dev (or plan to)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="packageTested"
                  checked={checkboxes.packageTested}
                  onChange={() => handleCheckboxChange('packageTested')}
                  className="w-4 h-4 text-emerald-500 rounded border-gray-600 focus:ring-emerald-500 bg-gray-700"
                />
                <label htmlFor="packageTested" className="ml-2 text-gray-300">
                  I've tested my Substreams to ensure it works correctly
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="packagePushed"
                  checked={checkboxes.packagePushed}
                  onChange={() => handleCheckboxChange('packagePushed')}
                  className="w-4 h-4 text-emerald-500 rounded border-gray-600 focus:ring-emerald-500 bg-gray-700"
                />
                <label htmlFor="packagePushed" className="ml-2 text-gray-300">
                  I've pushed my package to the registry (or know how to do it)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="documentationAdded"
                  checked={checkboxes.documentationAdded}
                  onChange={() => handleCheckboxChange('documentationAdded')}
                  className="w-4 h-4 text-emerald-500 rounded border-gray-600 focus:ring-emerald-500 bg-gray-700"
                />
                <label htmlFor="documentationAdded" className="ml-2 text-gray-300">
                  I've added documentation for my Substreams
                </label>
              </div>
            </div>
            
            <button
              onClick={handleCompleteClick}
              disabled={!allCheckboxesChecked}
              className={`mt-6 w-full py-2 px-4 rounded-md text-white font-semibold ${
                allCheckboxesChecked
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              Complete Quest
            </button>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-md text-sm text-blue-300">
            <p className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>For Hackathon Purposes:</strong> You can mark these items as complete even if you're still working on your Substreams project. These steps are part of the submission process for the hackathon.
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
          <h4 className="text-emerald-400 font-semibold text-lg mb-3">Quest Completed!</h4>
          <p className="text-gray-300 mb-4">
            Congratulations! You now know how to package and deploy your Substreams to make them available to others. Publishing your Substreams allows other developers to build upon your work and creates a more robust ecosystem.
          </p>
          
          <div className="bg-gray-800 p-5 rounded-lg mt-4">
            <h5 className="text-white font-medium mb-3">Hackathon Submission Guidelines</h5>
            <ul className="space-y-2 text-gray-300 list-disc pl-5">
              <li>Make sure your repository includes a comprehensive README with setup instructions</li>
              <li>Include a link to your published Substreams package in your submission</li>
              <li>Create a short demo video showing your Substreams in action</li>
              <li>Explain the problem your Substreams solves for Solana developers or users</li>
              <li>Highlight any innovative approaches or optimizations in your implementation</li>
            </ul>
            
            <div className="mt-4 text-sm text-yellow-300 bg-yellow-900/30 border border-yellow-700/30 p-3 rounded">
              <strong className="font-semibold">💡 Hackathon Tip:</strong> For the hackathon, consider doing something innovative with the data after it's indexed. Create a unique visualization, integrate with an AI service, or build a real-time notification system to showcase the power of your indexing solution.
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Resources:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li><a href="https://substreams.dev" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Substreams.dev Registry</a></li>
          <li><a href="https://docs.substreams.dev/tutorials/publishing-substreams/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Publishing a Substreams Package</a></li>
          <li><a href="https://docs.substreams.dev/reference/manifest-reference/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Substreams Manifest Reference</a></li>
        </ul>
      </div>
    </div>
  );
}; 