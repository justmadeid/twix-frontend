import React, { useState, useEffect } from 'react';
import { twitterAPI } from '../services/api';
import { Key, Settings, X } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeySet: (apiKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [currentApiKey, setCurrentApiKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const existingKey = twitterAPI.getApiKey();
      setCurrentApiKey(existingKey);
      setApiKey(existingKey || '');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      twitterAPI.setApiKey(apiKey.trim());
      onApiKeySet(apiKey.trim());
      onClose();
    }
  };

  const handleRemove = () => {
    twitterAPI.clearApiKey();
    setApiKey('');
    setCurrentApiKey(null);
    onApiKeySet('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">API Key Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your API key"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be stored in your browser's local storage
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save API Key
            </button>
            {currentApiKey && (
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
              >
                Remove
              </button>
            )}
          </div>
        </form>

        {currentApiKey && (
          <div className="mt-4 p-3 bg-green-50 rounded-md">
            <p className="text-sm text-green-800">
              ✓ API key is configured and ready to use
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const ApiKeyStatus: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    setHasApiKey(!!twitterAPI.getApiKey());
  }, []);

  const handleApiKeySet = (apiKey: string) => {
    setHasApiKey(!!apiKey);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          hasApiKey
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-red-100 text-red-800 hover:bg-red-200'
        }`}
      >
        <Key className="w-3 h-3" />
        <span>{hasApiKey ? 'API Key Set' : 'No API Key'}</span>
      </button>

      <ApiKeyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onApiKeySet={handleApiKeySet}
      />
    </>
  );
};
