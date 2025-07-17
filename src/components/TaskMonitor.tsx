import React, { useState, useEffect, useRef } from 'react';
import { twitterAPI } from '../services/api';
import { TaskStatus } from '../types/api';
import { CheckCircle, Clock, AlertCircle, X } from 'lucide-react';

interface TaskMonitorProps {
  taskId: string;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

const TaskMonitor: React.FC<TaskMonitorProps> = ({ taskId, onComplete, onError }) => {
  const [task, setTask] = useState<TaskStatus | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!taskId || !isPolling) return;

    const maxPolls = 60;
    let currentPollCount = 0;

    const pollTask = async () => {
      try {
        currentPollCount++;
        console.log(`Polling task ${taskId}, attempt ${currentPollCount}`);
        setPollCount(currentPollCount);
        
        const response = await twitterAPI.getTaskStatus(taskId);
        console.log('Raw API response:', response);
        
        const taskData = response.data || response;
        console.log('Task data:', taskData);
        
        setTask(taskData);

        if (taskData.status === 'completed' || taskData.status === 'SUCCESS') {
          console.log('Task completed:', taskData);
          setIsPolling(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onComplete?.(taskData.result || taskData);
        } else if (taskData.status === 'failed' || taskData.status === 'FAILED') {
          console.log('Task failed:', taskData);
          setIsPolling(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onError?.(taskData.error || 'Task failed');
        } else if (currentPollCount >= maxPolls) {
          console.log('Max polling attempts reached');
          setIsPolling(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onError?.('Task timeout - exceeded maximum polling attempts');
        }
      } catch (error) {
        console.error('Error polling task:', error);
        setIsPolling(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onError?.('Failed to fetch task status');
      }
    };

    pollTask();
    intervalRef.current = setInterval(pollTask, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [taskId, isPolling, onComplete, onError]);

  const stopPolling = () => {
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

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
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
      case 'FAILED':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'running':
      case 'PROCESSING':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
      case 'SUCCESS':
        return 'text-green-600';
      case 'failed':
      case 'FAILED':
        return 'text-red-600';
      case 'running':
      case 'PROCESSING':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getDisplayStatus = () => {
    switch (task.status) {
      case 'SUCCESS':
        return 'Completed';
      case 'FAILED':
        return 'Failed';
      case 'PROCESSING':
        return 'Running';
      default:
        return task.status.charAt(0).toUpperCase() + task.status.slice(1);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getDisplayStatus()}
            </span>
            {isPolling && (
              <p className="text-xs text-gray-500">
                Polling... (attempt {pollCount}/60)
              </p>
            )}
          </div>
          {task.progress && (
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          )}
        </div>
        {isPolling && (
          <button
            onClick={stopPolling}
            className="flex items-center space-x-1 px-3 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Stop</span>
          </button>
        )}
      </div>
      
      {(task.status === 'completed' || task.status === 'SUCCESS') && (
        <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
          ✅ Task completed successfully!
        </div>
      )}
      
      {(task.status === 'failed' || task.status === 'FAILED') && task.error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          ❌ Error: {task.error}
        </div>
      )}
    </div>
  );
};

export default TaskMonitor;
