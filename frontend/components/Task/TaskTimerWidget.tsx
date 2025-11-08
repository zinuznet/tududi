import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PlayIcon, StopIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Task } from '../../entities/Task';
import { startTimer, stopTimer } from '../../utils/tasksService';
import { useToast } from '../Shared/ToastContext';

interface TaskTimerWidgetProps {
    task: Task;
    onTimerUpdate: (updatedTask: Task) => void;
}

const TaskTimerWidget: React.FC<TaskTimerWidgetProps> = ({
    task,
    onTimerUpdate,
}) => {
    const { t } = useTranslation();
    const { showSuccessToast, showErrorToast } = useToast();
    const [isRunning, setIsRunning] = useState(!!task.timer_started_at);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Calculate elapsed time when timer is running
    useEffect(() => {
        if (!task.timer_started_at) {
            setElapsedTime(0);
            setIsRunning(false);
            return;
        }

        setIsRunning(true);

        // Calculate initial elapsed time
        const startTime = new Date(task.timer_started_at).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime) / 1000));

        // Update every second
        const interval = setInterval(() => {
            const currentNow = Date.now();
            setElapsedTime(Math.floor((currentNow - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [task.timer_started_at]);

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const formatHours = (hours: number | undefined): string => {
        if (!hours) return '0.0h';
        return `${hours.toFixed(1)}h`;
    };

    const handleStartTimer = async () => {
        if (!task.id) return;

        setIsLoading(true);
        try {
            const response = await startTimer(task.id);
            onTimerUpdate(response.task);
            showSuccessToast(
                t('timer.started', 'Timer started for {{taskName}}', {
                    taskName: task.name,
                })
            );
        } catch (error: any) {
            console.error('Error starting timer:', error);

            // Check if there's already an active timer on another task
            if (error.message && error.message.includes('already running')) {
                showErrorToast(
                    t(
                        'timer.alreadyRunning',
                        'Another timer is already running. Please stop it first.'
                    )
                );
            } else {
                showErrorToast(
                    t('timer.startError', 'Failed to start timer')
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleStopTimer = async () => {
        if (!task.id) return;

        setIsLoading(true);
        try {
            const response = await stopTimer(task.id);
            onTimerUpdate(response.task);

            const durationMinutes = Math.floor(response.duration_seconds / 60);
            showSuccessToast(
                t(
                    'timer.stopped',
                    'Timer stopped. Duration: {{duration}} minutes',
                    { duration: durationMinutes }
                )
            );
        } catch (error) {
            console.error('Error stopping timer:', error);
            showErrorToast(t('timer.stopError', 'Failed to stop timer'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
                {/* Left side - Time info */}
                <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {t('timer.estimated', 'Estimated')}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatHours(task.estimated_hours)}
                        </span>
                    </div>

                    <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />

                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {t('timer.actual', 'Actual')}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatHours(task.actual_hours)}
                        </span>
                    </div>

                    {isRunning && (
                        <>
                            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('timer.current', 'Current Session')}
                                </span>
                                <span className="text-sm font-mono font-medium text-blue-600 dark:text-blue-400">
                                    {formatTime(elapsedTime)}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Right side - Timer button */}
                <div className="flex items-center space-x-2">
                    {isRunning ? (
                        <button
                            onClick={handleStopTimer}
                            disabled={isLoading}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors duration-200"
                        >
                            <StopIcon className="h-5 w-5" />
                            <span>{t('timer.stop', 'Stop')}</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleStartTimer}
                            disabled={isLoading || task.parent_task_id !== undefined}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
                            title={
                                task.parent_task_id
                                    ? t(
                                          'timer.subtaskDisabled',
                                          'Time tracking is on parent task'
                                      )
                                    : ''
                            }
                        >
                            <PlayIcon className="h-5 w-5" />
                            <span>{t('timer.start', 'Start Timer')}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Progress bar (if estimated hours are set) */}
            {task.estimated_hours && task.estimated_hours > 0 && (
                <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>{t('timer.progress', 'Progress')}</span>
                        <span>
                            {Math.min(
                                100,
                                Math.round(
                                    ((task.actual_hours || 0) /
                                        task.estimated_hours) *
                                        100
                                )
                            )}
                            %
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                                (task.actual_hours || 0) <= task.estimated_hours
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                            }`}
                            style={{
                                width: `${Math.min(
                                    100,
                                    ((task.actual_hours || 0) /
                                        task.estimated_hours) *
                                        100
                                )}%`,
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskTimerWidget;
