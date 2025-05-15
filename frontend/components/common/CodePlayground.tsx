import React, { useState, useEffect } from 'react';

interface CodePlaygroundProps {
  initialCode: string;
  expectedPatterns?: RegExp[];
  hintText?: string;
  taskDescription: string;
  onValidCode?: () => void;
}

const CodePlayground: React.FC<CodePlaygroundProps> = ({
  initialCode,
  expectedPatterns = [],
  hintText,
  taskDescription,
  onValidCode,
}) => {
  const [code, setCode] = useState(initialCode);
  const [isValid, setIsValid] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [attemptedValidation, setAttemptedValidation] = useState(false);

  useEffect(() => {
    if (attemptedValidation) {
      validateCode();
    }
  }, [code, attemptedValidation]);

  const validateCode = () => {
    // Reset validation state
    let valid = true;
    let missingPatterns: number[] = [];

    // Check if the code is substantially different from the template
    if (code.trim() === initialCode.trim() || code.trim() === '') {
      setIsValid(false);
      setFeedback(code.trim() === '' 
        ? 'Please add some code to complete the task.' 
        : 'Add your own code to complete the implementation.');
      return;
    }

    // Check for each expected pattern
    expectedPatterns.forEach((pattern, index) => {
      if (!pattern.test(code)) {
        valid = false;
        missingPatterns.push(index);
      }
    });

    setIsValid(valid);

    // Generate feedback
    if (valid) {
      setFeedback('Great job! Your implementation looks correct.');
      onValidCode?.();
    } else if (missingPatterns.length > 0) {
      // More specific feedback based on missing patterns
      let feedbackMsg = 'Your code is missing some key elements:';
      
      // Determine which task we're on based on the code content
      if (code.includes('store_transfer_stats')) {
        // Store module task
        if (!code.match(/for.*in/)) {
          feedbackMsg += ' Need to iterate over transfers.';
        }
        if (!code.match(/store\.add\(/)) {
          feedbackMsg += ' Need to use store.add() function.';
        }
        if (!code.match(/transfer\.(from|to)/)) {
          feedbackMsg += ' Need to reference transfer properties.';
        }
      } else if (code.includes('map_wallet_activity')) {
        // Map function task
        if (!code.match(/store\.scan_prefix\(/)) {
          feedbackMsg += ' Need to use store.scan_prefix().';
        }
        if (!code.match(/\.push\(/)) {
          feedbackMsg += ' Need to add items to the collection.';
        }
        if (!code.match(/Ok\(response\)/)) {
          feedbackMsg += ' Need to return the proper result.';
        }
      } else if (code.toLowerCase().includes('select')) {
        // SQL query task
        if (!code.match(/SELECT/i)) {
          feedbackMsg += ' Need a SELECT statement.';
        }
        if (!code.match(/FROM\s+wallet_stats/i)) {
          feedbackMsg += ' Need to select FROM wallet_stats.';
        }
        if (!code.match(/ORDER\s+BY/i)) {
          feedbackMsg += ' Need an ORDER BY clause.';
        }
        if (!code.match(/LIMIT\s+10/i)) {
          feedbackMsg += ' Need to LIMIT results to 10.';
        }
      }
      
      setFeedback(feedbackMsg);
    } else {
      setFeedback('');
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleValidateClick = () => {
    setAttemptedValidation(true);
    validateCode();
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-700 overflow-hidden mb-4">
      <div className="p-3 bg-gray-800 border-b border-gray-700">
        <h4 className="text-white font-medium">{taskDescription}</h4>
      </div>
      
      <div className="p-4">
        <textarea
          value={code}
          onChange={handleCodeChange}
          className="w-full h-64 bg-gray-950 text-gray-300 p-4 rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
          spellCheck="false"
        />
      </div>
      
      <div className="p-3 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
        <div>
          {feedback && (
            <div className={`text-sm ${isValid ? 'text-emerald-400' : 'text-amber-400'}`}>
              {feedback}
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          {hintText && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded"
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
          )}
          
          <button
            onClick={handleValidateClick}
            className={`text-sm py-1 px-4 rounded ${
              isValid 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            Validate
          </button>
        </div>
      </div>
      
      {showHint && hintText && (
        <div className="p-3 bg-gray-850 border-t border-gray-700">
          <div className="text-sm text-amber-300">
            <span className="font-semibold">Hint:</span> {hintText}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodePlayground; 