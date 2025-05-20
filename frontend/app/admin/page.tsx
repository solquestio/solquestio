'use client';

import React, { useState } from 'react';

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [action, setAction] = useState('count-users');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    if (!adminKey) {
      setError('Admin key is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminKey,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmation = () => {
    if (action === 'delete-all-users') {
      const confirmed = window.confirm(
        '⚠️ WARNING: You are about to delete ALL USERS from the database. This action cannot be undone. Are you sure you want to continue?'
      );
      if (confirmed) {
        handleAction();
      }
    } else {
      handleAction();
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Database Management</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-gray-300 mb-2">Admin Key</label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
              placeholder="Enter admin key"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="count-users">Count Users</option>
              <option value="delete-all-users">Delete All Users</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={handleDeleteConfirmation}
          disabled={loading || !adminKey}
          className={`px-4 py-2 rounded font-medium ${
            action === 'delete-all-users'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition-colors ${
            loading || !adminKey ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Processing...' : action === 'delete-all-users' ? 'Delete All Users' : 'Execute Action'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 mb-6 text-red-300">
          <h3 className="font-bold text-lg mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-blue-900/40 border border-blue-700 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-lg mb-2 text-blue-300">Result</h3>
          <div className="bg-gray-800 p-3 rounded overflow-auto">
            <pre className="text-gray-200 text-sm whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      <div className="bg-amber-900/40 border border-amber-700 rounded-lg p-4">
        <h3 className="font-bold text-amber-300 mb-2">⚠️ Warning</h3>
        <p className="text-gray-300">
          This admin panel is for development purposes only. In a production environment, 
          this should be properly secured and accessible only to authorized personnel.
        </p>
      </div>
    </div>
  );
} 