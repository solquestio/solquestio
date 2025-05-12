export default function ApplicationHome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">SolQuest Application</h1>
      <p className="text-lg md:text-2xl text-gray-300 mb-8 max-w-xl text-center">
        Welcome to the SolQuest app! This is where the interactive learning, quests, and all main features will live.
      </p>
      <div className="bg-gray-800/60 rounded-xl p-6 shadow-lg">
        <ul className="list-disc list-inside text-left space-y-2">
          <li>🧭 Learning Paths</li>
          <li>🏆 On-chain Quest Verification</li>
          <li>🎮 Gamified Experience</li>
          <li>👥 Community Leaderboards</li>
          <li>🔒 Wallet Authentication</li>
          <li>🚀 Devnet & Mainnet Support</li>
        </ul>
      </div>
      <p className="mt-10 text-gray-400 text-sm">Start building your app features here!</p>
    </div>
  );
} 