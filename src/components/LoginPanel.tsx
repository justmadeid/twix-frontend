import React, { useState } from 'react';
import { twitterAPI } from '../services/api';
import { TwitterSettings } from '../types/api';
import { TaskMonitor } from './TaskMonitor';
import { LogIn, User } from 'lucide-react';

interface LoginPanelProps {
  credentials: TwitterSettings[];
  onLoginSuccess?: () => void;
}

export const LoginPanel: React.FC<LoginPanelProps> = ({ credentials, onLoginSuccess }) => {
  const [selectedCredential, setSelectedCredential] = useState('');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCredential) return;

    try {
      setIsLoading(true);
      const response = await twitterAPI.login({ credential_name: selectedCredential });
      setCurrentTaskId(response.data.task_id);
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  const handleTaskComplete = (result: any) => {
    console.log('Login successful:', result);
    setCurrentTaskId(null);
    setIsLoading(false);
    onLoginSuccess?.();
  };

  const handleTaskError = (error: string) => {
    console.error('Login failed:', error);
    setCurrentTaskId(null);
    setIsLoading(false);
  };
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <LogIn className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Twitter Login</h2>
            <p className="text-sm text-gray-500">Authenticate with your Twitter credentials</p>
          </div>
        </div>
      </div>      {credentials.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No credentials available</h3>
          <p className="text-gray-500">Add Twitter credentials first to login</p>
        </div>
      ) : (        <>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Credential
              </label>
              <select
                value={selectedCredential}
                onChange={(e) => setSelectedCredential(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white"
                required
              >
                <option value="">Choose a credential...</option>
                {credentials.map((cred) => (
                  <option key={cred.id} value={cred.credential_name}>
                    {cred.credential_name} ({cred.username})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading || !selectedCredential}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Login to Twitter</span>
                </>
              )}
            </button>
          </form>

          {currentTaskId && (
            <div className="mt-6 p-4 bg-green-50/50 backdrop-blur-sm rounded-xl border border-green-100">
              <TaskMonitor
                taskId={currentTaskId}
                onComplete={handleTaskComplete}
                onError={handleTaskError}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
