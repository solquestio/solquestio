'use client';
import React, { useState } from 'react';

interface SubstreamsSetupQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const SubstreamsSetupQuest: React.FC<SubstreamsSetupQuestProps> = ({ onQuestComplete, xpReward }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [checkboxes, setCheckboxes] = useState({
    rustInstalled: false,
    protobufInstalled: false,
    devcontainerSetup: false,
    substreamsCliInstalled: false,
    authenticationCompleted: false
  });
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleCheckboxChange = (checkbox: keyof typeof checkboxes) => {
    setCheckboxes(prev => ({
      ...prev,
      [checkbox]: !prev[checkbox]
    }));
  };

  const allChecked = Object.values(checkboxes).every(v => v === true);

  const handleSubmit = () => {
    if (allChecked) {
      setIsCompleted(true);
      onQuestComplete();
    }
  };

  const setups = [
    {
      title: "1. Install Dev Container",
      content: (
        <div className="space-y-4 text-gray-300">
          <p>
            The easiest way to set up your Substreams development environment is to use the provided Dev Container, which includes all the necessary tools.
          </p>
          <div className="bg-gray-800 p-4 rounded text-sm font-mono">
            <p># Clone the official Substreams template repository</p>
            <p>git clone https://github.com/streamingfast/substreams-template</p>
            <p>cd substreams-template</p>
          </div>
          <p>
            Open this folder in VSCode with the Dev Containers extension installed. VSCode will prompt you to "Reopen in Container" which will build the development environment.
          </p>
        </div>
      )
    },
    {
      title: "2. Manual Setup (Alternative)",
      content: (
        <div className="space-y-4 text-gray-300">
          <p>If you prefer manual setup, you'll need to install:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Rust (rustc, cargo)</li>
            <li>Protocol Buffers Compiler (protoc)</li>
            <li>Substreams CLI</li>
          </ul>
          
          <h5 className="text-white font-semibold mt-4">Install Rust</h5>
          <div className="bg-gray-800 p-3 rounded text-sm font-mono">
            <p># On Linux or macOS</p>
            <p>curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh</p>
            <p># On Windows, download and run rustup-init.exe from rustup.rs</p>
          </div>
          
          <h5 className="text-white font-semibold mt-4">Install Protocol Buffers</h5>
          <div className="bg-gray-800 p-3 rounded text-sm font-mono">
            <p># macOS</p>
            <p>brew install protobuf</p>
            <p># Linux</p>
            <p>apt install -y protobuf-compiler</p>
            <p># Windows (using Chocolatey)</p>
            <p>choco install protoc</p>
          </div>
        </div>
      )
    },
    {
      title: "3. Install Substreams CLI",
      content: (
        <div className="space-y-4 text-gray-300">
          <p>Install the Substreams CLI, which is used to build, package, and run Substreams:</p>
          
          <div className="bg-gray-800 p-3 rounded text-sm font-mono">
            <p># Using Homebrew (macOS/Linux)</p>
            <p>brew install streamingfast/tap/substreams</p>
            <p># From source</p>
            <p>cargo install --git https://github.com/streamingfast/substreams --tag v0.5.0 --locked --force substreams-cli</p>
          </div>
          
          <p className="mt-3">Verify your installation:</p>
          <div className="bg-gray-800 p-3 rounded text-sm font-mono">
            <p>substreams --version</p>
          </div>
          
          <div className="mt-4 bg-emerald-900/20 p-3 rounded text-sm border border-emerald-500/30">
            <p className="text-emerald-400 font-semibold">Note:</p>
            <p>If you're using the Dev Container, the Substreams CLI is already installed and available in your environment.</p>
          </div>
        </div>
      )
    },
    {
      title: "4. Authentication Setup",
      content: (
        <div className="space-y-4 text-gray-300">
          <p>
            To use the Substreams hosted services, you need to obtain an API key from substreams.dev:
          </p>
          
          <ol className="list-decimal pl-5 space-y-2">
            <li>Visit <a href="https://substreams.dev" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">substreams.dev</a> and sign up for an account</li>
            <li>Generate an API key from your dashboard</li>
            <li>Set up authentication in your CLI:</li>
          </ol>
          
          <div className="bg-gray-800 p-3 rounded text-sm font-mono mt-2">
            <p>substreams auth store-key -v</p>
            <p># When prompted, paste your API key</p>
          </div>
          
          <p className="mt-3">
            Test your authentication by running a simple command:
          </p>
          
          <div className="bg-gray-800 p-3 rounded text-sm font-mono">
            <p>substreams info solana:mainnet</p>
          </div>
          
          <p className="mt-3">
            This should return information about the Solana mainnet if your authentication is working correctly.
          </p>
        </div>
      )
    }
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-1">Environment Setup for Substreams</h3>
      {xpReward !== undefined && (
        <p className="text-sm font-semibold text-yellow-400 mb-4">
          +{xpReward} XP
        </p>
      )}
      
      <div className="text-gray-400 mb-6 space-y-3">
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            Before you can build and deploy Substreams, you need to set up your development environment. This quest will guide you through the installation of all required components.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>Development Containers:</strong> We recommend using a Dev Container for the easiest experience, as it comes pre-packaged with all necessary tools. Alternatively, you can set up the environment manually on your machine.
          </span>
        </p>
      </div>

      {!isCompleted ? (
        <>
          <div className="bg-dark-card-secondary p-5 rounded-lg mb-6">
            <div className="flex mb-4 border-b border-gray-700">
              {setups.map((setup, index) => (
                <button
                  key={index}
                  className={`py-2 px-4 font-medium ${
                    activeStep === index
                      ? 'text-emerald-400 border-b-2 border-emerald-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  {setup.title}
                </button>
              ))}
            </div>
            
            <div className="mt-4">
              {setups[activeStep].content}
            </div>
          </div>
          
          <div className="bg-dark-card-secondary p-5 rounded-lg">
            <h4 className="text-white font-semibold mb-4">Installation Verification</h4>
            <p className="text-gray-300 mb-4">
              Mark each step as completed once you've set up that component of your environment. You can choose between using the Dev Container or manual setup.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rustInstalled"
                  checked={checkboxes.rustInstalled}
                  onChange={() => handleCheckboxChange('rustInstalled')}
                  className="w-4 h-4 text-emerald-500 rounded border-gray-600 focus:ring-emerald-500 bg-gray-700"
                />
                <label htmlFor="rustInstalled" className="ml-2 text-gray-300">
                  Rust is installed and available (or using Dev Container)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="protobufInstalled"
                  checked={checkboxes.protobufInstalled}
                  onChange={() => handleCheckboxChange('protobufInstalled')}
                  className="w-4 h-4 text-emerald-500 rounded border-gray-600 focus:ring-emerald-500 bg-gray-700"
                />
                <label htmlFor="protobufInstalled" className="ml-2 text-gray-300">
                  Protocol Buffers compiler (protoc) is installed (or using Dev Container)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="devcontainerSetup"
                  checked={checkboxes.devcontainerSetup}
                  onChange={() => handleCheckboxChange('devcontainerSetup')}
                  className="w-4 h-4 text-emerald-500 rounded border-gray-600 focus:ring-emerald-500 bg-gray-700"
                />
                <label htmlFor="devcontainerSetup" className="ml-2 text-gray-300">
                  Dev Container is set up OR I've chosen manual setup
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="substreamsCliInstalled"
                  checked={checkboxes.substreamsCliInstalled}
                  onChange={() => handleCheckboxChange('substreamsCliInstalled')}
                  className="w-4 h-4 text-emerald-500 rounded border-gray-600 focus:ring-emerald-500 bg-gray-700"
                />
                <label htmlFor="substreamsCliInstalled" className="ml-2 text-gray-300">
                  Substreams CLI is installed and I've verified with `substreams --version`
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="authenticationCompleted"
                  checked={checkboxes.authenticationCompleted}
                  onChange={() => handleCheckboxChange('authenticationCompleted')}
                  className="w-4 h-4 text-emerald-500 rounded border-gray-600 focus:ring-emerald-500 bg-gray-700"
                />
                <label htmlFor="authenticationCompleted" className="ml-2 text-gray-300">
                  I've obtained an API key and set up authentication with the CLI
                </label>
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={!allChecked}
              className={`mt-6 w-full py-2 px-4 rounded-md font-semibold transition-colors ${
                allChecked
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              Complete Setup
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded text-sm text-blue-300">
            <p className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>For Hackathon Purposes:</strong> If you're preparing for the hackathon, you can mark these as complete even if you plan to set up the environment later. This quest is designed to show you what's required.
              </span>
            </p>
          </div>
        </>
      ) : (
        <div className="p-5 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
          <h4 className="text-emerald-400 font-semibold text-lg mb-3">Environment Setup Completed!</h4>
          <p className="text-gray-300 mb-4">
            Congratulations! You now have all the necessary tools installed to start developing Substreams for Solana. In the next quest, you'll learn how to create your first basic Substreams project.
          </p>
          
          <div className="bg-gray-800 p-4 rounded-md">
            <h5 className="text-white font-medium mb-2">Next Steps:</h5>
            <ul className="text-gray-300 space-y-2 list-disc pl-5">
              <li>Create a new Substreams project with <span className="text-emerald-400 font-mono">substreams init</span></li>
              <li>Learn to write modules to transform Solana blockchain data</li>
              <li>Deploy your Substreams and integrate with your applications</li>
            </ul>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-md">
            <p className="text-sm text-yellow-300">
              <span className="font-semibold">💡 Hackathon Tip:</span> When building for the hackathon, make sure to document your setup process well in your project's README.md. This makes it easier for judges to evaluate your submission.
            </p>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Resources:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li><a href="https://docs.substreams.dev/getting-started/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Substreams Getting Started Guide</a></li>
          <li><a href="https://docs.substreams.dev/reference/cli-reference/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Substreams CLI Reference</a></li>
          <li><a href="https://github.com/streamingfast/substreams-template" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Official Substreams Template Repository</a></li>
        </ul>
      </div>
    </div>
  );
}; 