import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { twitterAPI } from '../services/api';
import { TwitterSettings } from '../types/api';
import TaskMonitor from './TaskMonitor';
import { Settings, Plus, Edit2, Trash2, Key, LogIn, User, AlertTriangle, X } from 'lucide-react';

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
  };
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Key className="w-5 h-5 text-blue-600" />
            </div>            <div>
              <h2 className="text-xl font-semibold text-gray-900">Twitter Credentials</h2>
              <p className="text-sm text-gray-500">Manage your Twitter login credentials</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (editingId !== null) {
                handleCancelEdit();
              } else {
                setShowForm(!showForm);
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-[#0fbcf9] text-white rounded-xl hover:bg-[#0fbcf9]/90 transition-all duration-200 shadow-md hover:shadow-lg backdrop-blur-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">
              {editingId !== null ? 'Cancel Edit' : 'Add New'}
            </span>
          </button>
        </div>      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gray-50/50 backdrop-blur-sm rounded-xl border border-gray-200/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credential Name
              </label>
              <input
                type="text"
                required
                value={formData.credential_name}
                onChange={(e) => setFormData(prev => ({ ...prev, credential_name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="my_twitter_account"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="@username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-medium text-white bg-[#0fbcf9] rounded-xl hover:bg-[#0fbcf9]/90 transition-all duration-200 shadow-md hover:shadow-lg backdrop-blur-sm"
            >
              {editingId !== null ? 'Update Credentials' : 'Save Credentials'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {credentials.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No credentials saved yet</p>
              <p className="text-sm">Add your Twitter credentials to get started</p>
            </div>          ) : (
            credentials.map((cred) => (
              <div key={cred.id} className="flex items-center justify-between p-4 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:bg-gray-100/80 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#0fbcf9]/10 rounded-full">
                    <User className="w-4 h-4 text-[#0fbcf9]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{cred.credential_name}</h3>
                    <p className="text-sm text-gray-500">{cred.username}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">                  <button
                    onClick={() => handleLogin(cred.credential_name)}
                    disabled={loginLoading === cred.credential_name || currentTaskId !== null}
                    className="flex items-center space-x-2 px-3 py-2 bg-[#0fbcf9] text-white rounded-lg hover:bg-[#0fbcf9]/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium backdrop-blur-sm"
                  >
                    {loginLoading === cred.credential_name ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        <span>Logging in...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-3 h-3" />
                        <span>Login</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => handleEdit(cred)}
                    disabled={currentTaskId !== null || loginLoading !== null}
                    className="p-2 text-gray-400 hover:text-[#0fbcf9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                    title="Edit credentials"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>                  <button 
                    onClick={() => handleDelete(cred)}
                    disabled={currentTaskId !== null || loginLoading !== null}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete credentials"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}      {/* Task Monitor for Login */}
      {currentTaskId && (
        <div className="mt-6">
          <TaskMonitor
            taskId={currentTaskId}
            onComplete={handleTaskComplete}
            onError={handleTaskError}
          />
        </div>
      )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.credential && (
        <DeleteConfirmationModal
          credential={deleteModal.credential}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
};
