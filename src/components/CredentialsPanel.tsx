import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { twitterAPI } from '../services/api';
import { TwitterSettings } from '../types/api';
import TaskMonitor from './TaskMonitor';
import { Settings, Plus, Edit2, Trash2, Key, LogIn, User, AlertTriangle} from 'lucide-react';

// Delete Confirmation Modal Component
const DeleteConfirmationModal: React.FC<{
  credential: TwitterSettings;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ credential, onConfirm, onCancel }) => {
  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onCancel]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Credentials</h3>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
            <button
              onClick={onCancel}
              className="ml-auto p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              {/* <X className="w-4 h-4 text-gray-400" /> */}
            </button>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-3">
              Are you sure you want to delete the credentials for:
            </p>
            <div className="p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-[#0fbcf9]/10 rounded-full">
                  <User className="w-3 h-3 text-[#0fbcf9]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{credential.credential_name}</p>
                  <p className="text-sm text-gray-500">{credential.username}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const CredentialsPanel: React.FC = () => {
  const [credentials, setCredentials] = useState<TwitterSettings[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; credential: TwitterSettings | null }>({
    show: false,
    credential: null
  });
  const [formData, setFormData] = useState({
    credential_name: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      setIsLoading(true);
      const response = await twitterAPI.getCredentials();
      setCredentials(response.data);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setIsLoading(false);
    }
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        // Update existing credential
        await twitterAPI.updateCredentials(editingId, formData);
        setEditingId(null);
      } else {
        // Create new credential
        await twitterAPI.saveCredentials(formData);
      }
      setFormData({ credential_name: '', username: '', password: '' });
      setShowForm(false);
      fetchCredentials();
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };

  const handleEdit = (cred: TwitterSettings) => {
    setEditingId(cred.id);
    setFormData({
      credential_name: cred.credential_name,
      username: cred.username,
      password: '', // Don't pre-fill password for security
    });
    setShowForm(true);
  };  const handleDelete = async (credential: TwitterSettings) => {
    setDeleteModal({ show: true, credential });
  };

  const confirmDelete = async () => {
    if (!deleteModal.credential) return;
    
    try {
      await twitterAPI.deleteCredentials(deleteModal.credential.id);
      setDeleteModal({ show: false, credential: null });
      fetchCredentials();
    } catch (error) {
      console.error('Error deleting credentials:', error);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, credential: null });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ credential_name: '', username: '', password: '' });
    setShowForm(false);
  };

  const handleLogin = async (credentialName: string) => {
    try {
      setLoginLoading(credentialName);
      const response = await twitterAPI.login({ credential_name: credentialName });
      setCurrentTaskId(response.data.task_id);
    } catch (error) {
      console.error('Login failed:', error);
      setLoginLoading(null);
    }
  };

  const handleTaskComplete = (result: any) => {
    console.log('Login successful:', result);
    setCurrentTaskId(null);
    setLoginLoading(null);
  };

  const handleTaskError = (error: string) => {
    console.error('Login failed:', error);
    setCurrentTaskId(null);
    setLoginLoading(null);
  };  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Container - Bento Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-2xl border border-cyan-500/20">
              <Key className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Twitter Credentials</h2>
              <p className="text-sm text-gray-500 mt-1">Manage your Twitter login credentials securely</p>
            </div>
          </div>
          {/* Credentials count display */}
          {credentials.length > 0 && (
            <div className="hidden sm:block">
              <div className="px-3 py-1 bg-cyan-500/10 text-cyan-500 text-sm font-medium rounded-full">
                {credentials.length} credential{credentials.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Form - Enhanced Bento Grid */}
      {showForm && (
        <div className="grid grid-cols-12 gap-4">
          {/* Form Header - Bento Card */}
          <div className="col-span-12">
            <div className="bg-gradient-to-br from-cyan-50/80 to-blue-50/80 backdrop-blur-sm rounded-2xl border border-cyan-100/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-cyan-100 rounded-xl">
                  {editingId !== null ? <Edit2 className="w-5 h-5 text-cyan-600" /> : <Plus className="w-5 h-5 text-cyan-600" />}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingId !== null ? 'Edit Credentials' : 'Add New Credentials'}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                  {/* Credential Name Input */}
                  <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-4 hover:bg-white/90 hover:border-cyan-500/20 hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <label className="text-sm font-bold text-gray-700 mb-3 block">
                        Credential Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.credential_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, credential_name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white text-sm placeholder-gray-400"
                        placeholder="my_twitter_account"
                      />
                    </div>
                  </div>

                  {/* Username Input */}
                  <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-4 hover:bg-white/90 hover:border-cyan-500/20 hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <label className="text-sm font-bold text-gray-700 mb-3 block">
                        Username
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white text-sm placeholder-gray-400"
                        placeholder="@username"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-4 hover:bg-white/90 hover:border-cyan-500/20 hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <label className="text-sm font-bold text-gray-700 mb-3 block">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white text-sm placeholder-gray-400"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white/80 border border-gray-200 rounded-xl hover:bg-white hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl hover:from-cyan-600 hover:to-blue-600 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
                  >
                    {editingId !== null ? 'Update Credentials' : 'Save Credentials'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add New Button - When form is hidden */}
      {!showForm && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowForm(true)}
            className="group relative overflow-hidden bg-gradient-to-br from-cyan-500/10 backdrop-blur-lg rounded-2xl border border-cyan-500/20 p-6 hover:from-cyan-500/15 hover:border-cyan-500/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            <div className="relative flex items-center space-x-3">
              <div className="p-2 bg-cyan-500/10 rounded-xl group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all duration-300">
                <Plus className="w-5 h-5 text-cyan-500" />
              </div>
              <span className="text-sm font-bold text-gray-700 group-hover:text-cyan-500 transition-colors duration-300">
                Add New Credentials
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Credentials List - Bento Grid */}
      {isLoading ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500">Loading credentials...</p>
        </div>
      ) : credentials.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-50/80 to-gray-50/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-gray-100 rounded-2xl">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No credentials saved yet</h3>
          <p className="text-gray-500 mb-6">Add your Twitter credentials to get started with data collection</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span className="font-semibold">Add First Credential</span>
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-50/80 to-gray-50/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-slate-100 rounded-xl">
              <User className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Saved Credentials ({credentials.length})</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {credentials.map((cred, index) => (
              <div 
                key={cred.id} 
                className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl border border-white/60 p-6 hover:bg-white/95 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Credential Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-cyan-100 rounded-xl group-hover:bg-cyan-200 transition-colors duration-300">
                      <User className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors duration-300">
                        {cred.credential_name}
                      </h4>
                      <p className="text-sm text-gray-500 group-hover:text-cyan-500 transition-colors duration-300">
                        {cred.username}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleEdit(cred)}
                      disabled={currentTaskId !== null || loginLoading !== null}
                      className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Edit credentials"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cred)}
                      disabled={currentTaskId !== null || loginLoading !== null}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete credentials"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  onClick={() => handleLogin(cred.credential_name)}
                  disabled={loginLoading === cred.credential_name || currentTaskId !== null}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                >
                  {loginLoading === cred.credential_name ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span className="font-semibold">Logging in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span className="font-semibold">Login with this account</span>
                    </>
                  )}
                </button>

                {/* Credential Info */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created: {new Date(cred.created_at).toLocaleDateString()}</span>
                    <span>Updated: {new Date(cred.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Monitor for Login */}
      {currentTaskId && (
        <div className="bg-cyan-500/10 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-4">
          <TaskMonitor
            taskId={currentTaskId}
            onComplete={handleTaskComplete}
            onError={handleTaskError}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}      {deleteModal.show && deleteModal.credential && (
        <DeleteConfirmationModal
          credential={deleteModal.credential}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
      </div>
    </div>
  );
};
