import React, { useState, useEffect } from 'react';
import { twitterAPI } from '../services/api';
import { TaskStatus } from '../types/api';
import { CheckCircle, Clock, AlertCircle, X } from 'lucide-react';

interface TaskMonitorProps {
  taskId: string;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

export const TaskMonitor: React.FC<TaskMonitorProps> = ({ taskId, onComplete, onError }) => {
  const [task, setTask] = useState<TaskStatus | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (!taskId || !isPolling) return;

    const pollTask = async () => {
      try {
        const response = await twitterAPI.getTaskStatus(taskId);
        setTask(response.data);

        if (response.data.status === 'completed') {
          setIsPolling(false);
          onComplete?.(response.data.result);
        } else if (response.data.status === 'failed') {
          setIsPolling(false);
          onError?.(response.data.error || 'Task failed');
        }
      } catch (error) {
        console.error('Error polling task:', error);
        setIsPolling(false);
        onError?.('Failed to fetch task status');
      }
    };

    pollTask();
    const interval = setInterval(pollTask, 2000);

    return () => clearInterval(interval);
  }, [taskId, isPolling, onComplete, onError]);

  if (!task) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Clock className="w-4 h-4 animate-spin" />
        <span>Loading task...</span>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'running':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </span>
        {task.progress && (
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        )}
      </div>
      <button
        onClick={() => setIsPolling(false)}
        className="text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
