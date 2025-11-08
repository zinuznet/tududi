import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ClockIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import {
    TimeEntry,
    fetchTimeEntries,
    createManualTimeEntry,
} from '../../utils/tasksService';
import { useToast } from '../Shared/ToastContext';
import { format, parseISO } from 'date-fns';

interface TimeEntryHistoryProps {
    taskId: number;
    onTimeEntryAdded?: () => void;
}

const TimeEntryHistory: React.FC<TimeEntryHistoryProps> = ({
    taskId,
    onTimeEntryAdded,
}) => {
    const { t } = useTranslation();
    const { showSuccessToast, showErrorToast } = useToast();
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        startedAt: '',
        stoppedAt: '',
        note: '',
    });

    useEffect(() => {
        loadTimeEntries();
    }, [taskId]);

    const loadTimeEntries = async () => {
        try {
            setLoading(true);
            const data = await fetchTimeEntries(taskId);
            // Sort by started_at descending (newest first)
            const sortedEntries = data.sort(
                (a, b) =>
                    new Date(b.started_at).getTime() -
                    new Date(a.started_at).getTime()
            );
            setEntries(sortedEntries);
        } catch (error) {
            console.error('Error loading time entries:', error);
            showErrorToast(
                t('timeEntry.loadError', 'Failed to load time entries')
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds: number | null): string => {
        if (!seconds) return '0m';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const formatDateTime = (dateString: string): string => {
        try {
            return format(parseISO(dateString), 'MMM d, yyyy HH:mm');
        } catch {
            return dateString;
        }
    };

    const handleAddEntry = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.startedAt || !formData.stoppedAt) {
            showErrorToast(
                t('timeEntry.requiredFields', 'Start and end times are required')
            );
            return;
        }

        try {
            await createManualTimeEntry(taskId, {
                started_at: formData.startedAt,
                stopped_at: formData.stoppedAt,
                note: formData.note || undefined,
            });

            showSuccessToast(
                t('timeEntry.added', 'Time entry added successfully')
            );

            // Reset form and reload
            setFormData({ startedAt: '', stoppedAt: '', note: '' });
            setShowAddForm(false);
            await loadTimeEntries();

            if (onTimeEntryAdded) {
                onTimeEntryAdded();
            }
        } catch (error) {
            console.error('Error adding time entry:', error);
            showErrorToast(t('timeEntry.addError', 'Failed to add time entry'));
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    {t('timeEntry.history', 'Time Entry History')}
                </h3>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                    <PlusIcon className="h-4 w-4" />
                    <span>{t('timeEntry.addManual', 'Add Manual Entry')}</span>
                </button>
            </div>

            {/* Add Manual Entry Form */}
            {showAddForm && (
                <form
                    onSubmit={handleAddEntry}
                    className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('timeEntry.startedAt', 'Started At')}
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.startedAt}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        startedAt: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('timeEntry.stoppedAt', 'Stopped At')}
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.stoppedAt}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        stoppedAt: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('timeEntry.note', 'Note (optional)')}
                        </label>
                        <input
                            type="text"
                            value={formData.note}
                            onChange={(e) =>
                                setFormData({ ...formData, note: e.target.value })
                            }
                            placeholder={t(
                                'timeEntry.notePlaceholder',
                                'e.g., Forgot to start timer'
                            )}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                        >
                            {t('common.cancel', 'Cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                        >
                            {t('timeEntry.save', 'Save Entry')}
                        </button>
                    </div>
                </form>
            )}

            {/* Time Entries List */}
            {entries.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <ClockIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>{t('timeEntry.noEntries', 'No time entries yet')}</p>
                    <p className="text-sm mt-1">
                        {t(
                            'timeEntry.startTimerHelp',
                            'Start the timer or add a manual entry'
                        )}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 text-sm text-gray-900 dark:text-gray-100">
                                    <span className="font-medium">
                                        {formatDuration(entry.duration_seconds)}
                                    </span>
                                    {entry.is_manual && (
                                        <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                                            {t('timeEntry.manual', 'Manual')}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formatDateTime(entry.started_at)} →{' '}
                                    {entry.stopped_at
                                        ? formatDateTime(entry.stopped_at)
                                        : t('timeEntry.running', 'Running...')}
                                </div>
                                {entry.note && (
                                    <div className="text-xs text-gray-600 dark:text-gray-400 italic mt-1">
                                        {entry.note}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Total Summary */}
            {entries.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {t('timeEntry.totalEntries', 'Total Entries')}:
                        </span>
                        <span className="text-gray-900 dark:text-gray-100">
                            {entries.length}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {t('timeEntry.totalTime', 'Total Time')}:
                        </span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                            {formatDuration(
                                entries.reduce(
                                    (sum, entry) =>
                                        sum + (entry.duration_seconds || 0),
                                    0
                                )
                            )}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeEntryHistory;
