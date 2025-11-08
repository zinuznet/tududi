import React, { useState, useEffect } from 'react';
import { Task } from '../../entities/Task';
import {
    fetchSmartSuggestions,
    PlannerContext,
} from '../../utils/plannerService';
import { useTranslation } from 'react-i18next';
import {
    ClockIcon,
    BoltIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import TaskItem from '../Task/TaskItem';
import { Project } from '../../entities/Project';

interface SmartPlannerProps {
    onTaskUpdate: (task: Task) => Promise<void>;
    onTaskDelete: (taskId: number) => Promise<void>;
    projects: Project[];
}

const SmartPlanner: React.FC<SmartPlannerProps> = ({
    onTaskUpdate,
    onTaskDelete,
    projects,
}) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [context, setContext] = useState<PlannerContext | null>(null);
    const [suggestions, setSuggestions] = useState<Task[]>([]);

    useEffect(() => {
        loadSuggestions();
    }, []);

    const loadSuggestions = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetchSmartSuggestions();
            setContext(response.context);
            setSuggestions(response.suggestions);
        } catch (err) {
            console.error('Failed to load smart suggestions:', err);
            setError('Failed to load suggestions');
        } finally {
            setLoading(false);
        }
    };

    const getTimeIcon = () => {
        if (!context) return <ClockIcon className="h-5 w-5" />;

        const { timeOfDay } = context;
        return <ClockIcon className="h-5 w-5" />;
    };

    const getEnergyColor = () => {
        if (!context) return 'text-gray-600';

        const colors = {
            high: 'text-green-600 dark:text-green-400',
            medium: 'text-yellow-600 dark:text-yellow-400',
            low: 'text-orange-600 dark:text-orange-400',
        };

        return colors[context.typicalEnergy] || 'text-gray-600';
    };

    const getContextDescription = () => {
        if (!context) return '';

        const timeLabels = {
            morning: t('planner.morning', 'Morning'),
            afternoon: t('planner.afternoon', 'Afternoon'),
            evening: t('planner.evening', 'Evening'),
        };

        const energyLabels = {
            high: t('planner.highEnergy', 'High Energy'),
            medium: t('planner.mediumEnergy', 'Medium Energy'),
            low: t('planner.lowEnergy', 'Low Energy'),
        };

        const timeLabel = timeLabels[context.timeOfDay];
        const energyLabel = energyLabels[context.typicalEnergy];

        return `${timeLabel} • ${energyLabel}`;
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <SparklesIcon className="h-5 w-5 animate-pulse" />
                    <span>{t('planner.loading', 'Loading smart suggestions...')}</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="text-red-600 dark:text-red-400">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-md p-6 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <SparklesIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {t('planner.title', 'Smart Suggestions')}
                    </h2>
                </div>
                <button
                    onClick={loadSuggestions}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    {t('common.refresh', 'Refresh')}
                </button>
            </div>

            {/* Context Info */}
            {context && (
                <div className="flex items-center space-x-4 mb-6 text-sm">
                    <div className="flex items-center space-x-2">
                        {getTimeIcon()}
                        <span className="text-gray-700 dark:text-gray-300">
                            {getContextDescription()}
                        </span>
                    </div>
                    {!context.inWorkHours && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                            {t('planner.outsideWorkHours', 'Outside work hours')}
                        </span>
                    )}
                </div>
            )}

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t(
                    'planner.description',
                    'Based on your current energy level and time of day, here are the best tasks to work on right now:'
                )}
            </p>

            {/* Suggestions */}
            {suggestions.length > 0 ? (
                <div className="space-y-2">
                    {suggestions.slice(0, 5).map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onTaskUpdate={onTaskUpdate}
                            onTaskDelete={onTaskDelete}
                            projects={projects}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>
                        {t(
                            'planner.noSuggestions',
                            'No tasks match your current context. Try creating tasks with energy levels and time preferences!'
                        )}
                    </p>
                </div>
            )}

            {suggestions.length > 5 && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t(
                            'planner.moreSuggestions',
                            `+ ${suggestions.length - 5} more suggestions`
                        )}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SmartPlanner;
