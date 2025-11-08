import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SplitTaskModalProps {
    taskName: string;
    onConfirm: (task1Name: string, task2Name: string, task1Description?: string, task2Description?: string) => void;
    onCancel: () => void;
}

const SplitTaskModal: React.FC<SplitTaskModalProps> = ({
    taskName,
    onConfirm,
    onCancel,
}) => {
    const { t } = useTranslation();
    const [task1Name, setTask1Name] = useState('');
    const [task2Name, setTask2Name] = useState('');
    const [task1Description, setTask1Description] = useState('');
    const [task2Description, setTask2Description] = useState('');
    const [showDescriptions, setShowDescriptions] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (task1Name.trim() && task2Name.trim()) {
            onConfirm(
                task1Name.trim(),
                task2Name.trim(),
                task1Description.trim() || undefined,
                task2Description.trim() || undefined
            );
        }
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={onCancel}
        >
            <div
                className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {t('task.splitTask', 'Split Task')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    {t('task.splitTaskDescription', 'Split')} "<span className="font-medium">{taskName}</span>" {t('task.splitTaskIntoTwo', 'into two separate tasks')}
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 mb-6">
                        {/* Task 1 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('task.firstTaskName', 'First Task Name')} *
                            </label>
                            <input
                                type="text"
                                value={task1Name}
                                onChange={(e) => setTask1Name(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder={t('task.enterFirstTaskName', 'Enter first task name...')}
                                autoFocus
                                required
                            />
                        </div>

                        {/* Task 2 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('task.secondTaskName', 'Second Task Name')} *
                            </label>
                            <input
                                type="text"
                                value={task2Name}
                                onChange={(e) => setTask2Name(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder={t('task.enterSecondTaskName', 'Enter second task name...')}
                                required
                            />
                        </div>

                        {/* Optional descriptions toggle */}
                        <div>
                            <button
                                type="button"
                                onClick={() => setShowDescriptions(!showDescriptions)}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                                {showDescriptions
                                    ? t('task.hideDescriptions', 'Hide descriptions')
                                    : t('task.addDescriptions', 'Add descriptions (optional)')}
                            </button>
                        </div>

                        {/* Optional descriptions */}
                        {showDescriptions && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('task.firstTaskDescription', 'First Task Description')}
                                    </label>
                                    <textarea
                                        value={task1Description}
                                        onChange={(e) => setTask1Description(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        rows={3}
                                        placeholder={t('task.enterDescription', 'Enter description...')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('task.secondTaskDescription', 'Second Task Description')}
                                    </label>
                                    <textarea
                                        value={task2Description}
                                        onChange={(e) => setTask2Description(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        rows={3}
                                        placeholder={t('task.enterDescription', 'Enter description...')}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>{t('task.splitNote', 'Note:')}</strong> {t('task.splitNoteDescription', 'The original task will be archived, and two new independent tasks will be created with the same tags, project, and priority.')}
                        </p>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none transition-colors"
                        >
                            {t('common.cancel', 'Cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={!task1Name.trim() || !task2Name.trim()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {t('task.splitTaskButton', 'Split Task')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SplitTaskModal;
