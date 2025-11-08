import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, StopIcon } from '@heroicons/react/24/outline';
import { Task } from '../../entities/Task';
import { stopTimer } from '../../utils/tasksService';
import { useToast } from '../Shared/ToastContext';

interface ActiveTimerWidgetProps {
    activeTask: Task | null;
    onTimerStopped: () => void;
}

const ActiveTimerWidget: React.FC<ActiveTimerWidgetProps> = ({
    activeTask,
    onTimerStopped,
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showSuccessToast, showErrorToast } = useToast();
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isStopping, setIsStopping] = useState(false);

    // Calculate and update elapsed time
    useEffect(() => {
        if (!activeTask?.timer_started_at) {
            setElapsedTime(0);
            return;
        }

        const startTime = new Date(activeTask.timer_started_at).getTime();

        // Initial calculation
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime) / 1000));

        // Update every second
        const interval = setInterval(() => {
            const currentNow = Date.now();
            setElapsedTime(Math.floor((currentNow - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [activeTask?.timer_started_at]);

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStopTimer = async () => {
        if (!activeTask?.id || isStopping) return;

        setIsStopping(true);
        try {
            const response = await stopTimer(activeTask.id);
            const durationMinutes = Math.floor(response.duration_seconds / 60);

            showSuccessToast(
                t('timer.stopped', 'Timer stopped. Duration: {{duration}} minutes', {
                    duration: durationMinutes,
                })
            );

            onTimerStopped();
        } catch (error) {
            console.error('Error stopping timer:', error);
            showErrorToast(t('timer.stopError', 'Failed to stop timer'));
        } finally {
            setIsStopping(false);
        }
    };

    const handleTaskClick = () => {
        if (activeTask?.uid) {
            navigate(`/task/${activeTask.uid}`);
        }
    };

    if (!activeTask) {
        return null;
    }

    return (
        <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg shadow-lg p-4 text-white">
            <div className="flex items-center justify-between">
                {/* Left side - Timer info */}
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {/* Pulsing icon */}
                    <div className="relative flex-shrink-0">
                        <span className="flex relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <ClockIcon className="relative h-8 w-8 text-white" />
                        </span>
                    </div>

                    {/* Task info */}
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-blue-100 mb-1">
                            {t('timer.currentlyTracking', 'Currently Tracking')}
                        </div>
                        <button
                            onClick={handleTaskClick}
                            className="text-left hover:underline focus:outline-none focus:underline"
                        >
                            <div className="font-semibold text-white truncate text-lg">
                                {activeTask.name}
                            </div>
                        </button>
                        {activeTask.Project && (
                            <div className="text-xs text-blue-100 mt-0.5">
                                {activeTask.Project.name}
                            </div>
                        )}
                    </div>

                    {/* Elapsed time */}
                    <div className="flex-shrink-0 text-center">
                        <div className="text-3xl font-mono font-bold text-white">
                            {formatTime(elapsedTime)}
                        </div>
                        <div className="text-xs text-blue-100 mt-1">
                            {t('timer.elapsed', 'Elapsed')}
                        </div>
                    </div>
                </div>

                {/* Right side - Stop button */}
                <div className="ml-6 flex-shrink-0">
                    <button
                        onClick={handleStopTimer}
                        disabled={isStopping}
                        className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors duration-200 font-semibold shadow-md"
                    >
                        <StopIcon className="h-5 w-5" />
                        <span>{t('timer.stop', 'Stop')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActiveTimerWidget;
