import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    PlayIcon,
    PauseIcon,
    StopIcon,
    ForwardIcon,
} from '@heroicons/react/24/solid';
import { Task } from '../../entities/Task';
import { notificationService } from '../../services/notificationService';

interface PomodoroTimerProps {
    task?: Task;
    onStop?: () => void;
    userSettings: {
        pomodoro_work_minutes: number;
        pomodoro_short_break_minutes: number;
        pomodoro_long_break_minutes: number;
        pomodoro_sessions_until_long_break: number;
    };
}

type Phase = 'work' | 'short_break' | 'long_break';

interface PomodoroState {
    phase: Phase;
    currentSession: number;
    remainingSeconds: number;
    isRunning: boolean;
    totalSessions: number;
}

const STORAGE_KEY = 'pomodoro_timer_state';

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
    task,
    onStop,
    userSettings,
}) => {
    const { t } = useTranslation();

    // Calculate session duration based on phase
    const getSessionDuration = useCallback(
        (phase: Phase): number => {
            switch (phase) {
                case 'work':
                    return userSettings.pomodoro_work_minutes * 60;
                case 'short_break':
                    return userSettings.pomodoro_short_break_minutes * 60;
                case 'long_break':
                    return userSettings.pomodoro_long_break_minutes * 60;
            }
        },
        [userSettings]
    );

    // Initialize state from localStorage or defaults
    const initializeState = useCallback((): PomodoroState => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Validate that saved state is for same task
                if (task && parsed.taskId !== task.id) {
                    throw new Error('Different task');
                }
                return {
                    phase: parsed.phase || 'work',
                    currentSession: parsed.currentSession || 1,
                    remainingSeconds: parsed.remainingSeconds || getSessionDuration('work'),
                    isRunning: false, // Always start paused on load
                    totalSessions: parsed.totalSessions || 0,
                };
            }
        } catch (e) {
            // Invalid saved state, use defaults
        }

        return {
            phase: 'work',
            currentSession: 1,
            remainingSeconds: getSessionDuration('work'),
            isRunning: false,
            totalSessions: 0,
        };
    }, [task, getSessionDuration]);

    const [state, setState] = useState<PomodoroState>(initializeState);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [completedPomodoros, setCompletedPomodoros] = useState<number>(0);

    // Persist state to localStorage
    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                ...state,
                taskId: task?.id,
            })
        );
    }, [state, task]);

    // Load today's completed pomodoros
    useEffect(() => {
        const today = new Date().toDateString();
        const stored = localStorage.getItem(`pomodoros_${today}`);
        if (stored) {
            setCompletedPomodoros(parseInt(stored, 10));
        }
    }, []);

    // Save completed pomodoro
    const incrementCompletedPomodoros = () => {
        const today = new Date().toDateString();
        const newCount = completedPomodoros + 1;
        setCompletedPomodoros(newCount);
        localStorage.setItem(`pomodoros_${today}`, newCount.toString());
    };

    // Timer tick
    useEffect(() => {
        if (state.isRunning) {
            timerRef.current = setInterval(() => {
                setState((prev) => {
                    if (prev.remainingSeconds <= 0) {
                        return prev;
                    }

                    const newRemaining = prev.remainingSeconds - 1;

                    if (newRemaining <= 0) {
                        // Phase completed!
                        return handlePhaseComplete(prev);
                    }

                    return {
                        ...prev,
                        remainingSeconds: newRemaining,
                    };
                });
            }, 1000);

            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        }
    }, [state.isRunning, userSettings]);

    // Handle phase completion
    const handlePhaseComplete = (currentState: PomodoroState): PomodoroState => {
        let nextPhase: Phase;
        let nextSession = currentState.currentSession;
        let totalSessions = currentState.totalSessions;

        if (currentState.phase === 'work') {
            // Work session completed
            totalSessions += 1;
            incrementCompletedPomodoros();

            // Determine next break type
            if (currentState.currentSession >= userSettings.pomodoro_sessions_until_long_break) {
                nextPhase = 'long_break';
                nextSession = 1; // Reset session counter after long break
            } else {
                nextPhase = 'short_break';
                nextSession += 1;
            }

            // Notification
            if (notificationService.isGranted()) {
                notificationService.notify({
                    title: '🎉 Pomodoro Completed!',
                    body: `Great work! Time for a ${nextPhase === 'long_break' ? 'long' : 'short'} break.`,
                    tag: 'pomodoro-complete',
                });
            }
        } else {
            // Break completed, back to work
            nextPhase = 'work';

            // Notification
            if (notificationService.isGranted()) {
                notificationService.notify({
                    title: '🍅 Break Over',
                    body: `Ready to focus? Let's start session ${nextSession}/${userSettings.pomodoro_sessions_until_long_break}`,
                    tag: 'pomodoro-break-over',
                });
            }
        }

        return {
            phase: nextPhase,
            currentSession: nextSession,
            remainingSeconds: getSessionDuration(nextPhase),
            isRunning: false, // Pause between phases (user can start when ready)
            totalSessions,
        };
    };

    // Control functions
    const handleStart = () => {
        if (notificationService.isSupported() && !notificationService.isGranted()) {
            notificationService.requestPermission();
        }

        setState((prev) => ({ ...prev, isRunning: true }));
    };

    const handlePause = () => {
        setState((prev) => ({ ...prev, isRunning: false }));
    };

    const handleStop = () => {
        setState({
            phase: 'work',
            currentSession: 1,
            remainingSeconds: getSessionDuration('work'),
            isRunning: false,
            totalSessions: 0,
        });
        localStorage.removeItem(STORAGE_KEY);

        if (onStop) {
            onStop();
        }
    };

    const handleSkip = () => {
        setState((prev) => handlePhaseComplete(prev));
    };

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress percentage
    const getProgress = (): number => {
        const totalDuration = getSessionDuration(state.phase);
        return ((totalDuration - state.remainingSeconds) / totalDuration) * 100;
    };

    // Get phase label
    const getPhaseLabel = (): string => {
        switch (state.phase) {
            case 'work':
                return t('pomodoro.work', `Work Session ${state.currentSession}/${userSettings.pomodoro_sessions_until_long_break}`);
            case 'short_break':
                return t('pomodoro.shortBreak', 'Short Break');
            case 'long_break':
                return t('pomodoro.longBreak', 'Long Break');
        }
    };

    // Get phase color
    const getPhaseColor = (): string => {
        switch (state.phase) {
            case 'work':
                return 'text-blue-600 dark:text-blue-400';
            case 'short_break':
                return 'text-orange-600 dark:text-orange-400';
            case 'long_break':
                return 'text-purple-600 dark:text-purple-400';
        }
    };

    // Get progress bar color
    const getProgressColor = (): string => {
        switch (state.phase) {
            case 'work':
                return 'bg-blue-500';
            case 'short_break':
                return 'bg-orange-500';
            case 'long_break':
                return 'bg-purple-500';
        }
    };

    // Session dots
    const renderSessionDots = () => {
        const dots = [];
        for (let i = 1; i <= userSettings.pomodoro_sessions_until_long_break; i++) {
            const isCompleted = i < state.currentSession;
            const isCurrent = i === state.currentSession && state.phase === 'work';

            dots.push(
                <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                        isCompleted
                            ? 'bg-green-500 dark:bg-green-400'
                            : isCurrent
                            ? 'bg-blue-500 dark:bg-blue-400'
                            : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    title={`Session ${i}`}
                />
            );
        }
        return dots;
    };

    return (
        <div className="flex flex-col items-center space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Phase Label */}
            <div className={`text-lg font-semibold ${getPhaseColor()}`}>
                {getPhaseLabel()}
            </div>

            {/* Circular Progress (visual representation) */}
            <div className="relative w-48 h-48">
                {/* Background circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        className={
                            state.phase === 'work'
                                ? 'text-blue-500'
                                : state.phase === 'short_break'
                                ? 'text-orange-500'
                                : 'text-purple-500'
                        }
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - getProgress() / 100)}`}
                        style={{
                            transition: 'stroke-dashoffset 1s linear',
                        }}
                    />
                </svg>

                {/* Timer display in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                        {formatTime(state.remainingSeconds)}
                    </div>
                    {task && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center px-4 truncate max-w-full">
                            {task.name}
                        </div>
                    )}
                </div>
            </div>

            {/* Session Dots */}
            <div className="flex space-x-2">{renderSessionDots()}</div>

            {/* Controls */}
            <div className="flex space-x-2">
                {!state.isRunning ? (
                    <button
                        onClick={handleStart}
                        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 transition-colors"
                    >
                        <PlayIcon className="h-5 w-5" />
                        {t('pomodoro.start', 'Start')}
                    </button>
                ) : (
                    <button
                        onClick={handlePause}
                        className="px-6 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center gap-2 transition-colors"
                    >
                        <PauseIcon className="h-5 w-5" />
                        {t('pomodoro.pause', 'Pause')}
                    </button>
                )}

                <button
                    onClick={handleSkip}
                    disabled={!state.isRunning && state.remainingSeconds === getSessionDuration(state.phase)}
                    className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    title={t('pomodoro.skip', 'Skip to next phase')}
                >
                    <ForwardIcon className="h-5 w-5" />
                </button>

                <button
                    onClick={handleStop}
                    className="px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2 transition-colors"
                    title={t('pomodoro.stop', 'Stop and reset')}
                >
                    <StopIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Today's Stats */}
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                🍅 {completedPomodoros} {t('pomodoro.completedToday', 'pomodoros completed today')}
            </div>
        </div>
    );
};

export default PomodoroTimer;
