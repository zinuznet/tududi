import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Task } from '../../entities/Task';
import { SubtaskTemplate } from '../../entities/SubtaskTemplate';
import {
    fetchSubtaskTemplates,
    applyTemplateToTask,
} from '../../utils/subtaskTemplatesService';
import { useToast } from '../Shared/ToastContext';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

interface ApplyTemplateButtonProps {
    task: Task;
    onTemplateApplied: () => void;
}

const ApplyTemplateButton: React.FC<ApplyTemplateButtonProps> = ({
    task,
    onTemplateApplied,
}) => {
    const { t } = useTranslation();
    const { showSuccessToast, showErrorToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [templates, setTemplates] = useState<SubtaskTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [applying, setApplying] = useState(false);

    // Don't show button for subtasks
    if (task.parent_task_id) {
        return null;
    }

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const fetchedTemplates = await fetchSubtaskTemplates();
            setTemplates(fetchedTemplates);
        } catch (error) {
            console.error('Error loading templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        loadTemplates();
    };

    const handleApply = async (templateId: number, templateName: string) => {
        if (!task.id) return;

        setApplying(true);
        try {
            await applyTemplateToTask(templateId, task.id);
            showSuccessToast(
                t(
                    'template.applied',
                    `Template "${templateName}" applied successfully`
                )
            );
            setIsOpen(false);
            onTemplateApplied();
        } catch (error) {
            showErrorToast(
                t('template.applyError', 'Failed to apply template')
            );
        } finally {
            setApplying(false);
        }
    };

    return (
        <>
            {/* Apply Template Button */}
            <button
                onClick={handleOpen}
                className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded transition-colors"
                title={t('template.applyTemplate', 'Apply Template')}
            >
                <DocumentDuplicateIcon className="h-4 w-4" />
            </button>

            {/* Template Selection Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                            {t('template.selectTemplate', 'Select Template')}
                        </h2>

                        {loading ? (
                            <p className="text-gray-500 dark:text-gray-400">
                                {t('common.loading', 'Loading...')}
                            </p>
                        ) : templates.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    {t(
                                        'template.noTemplates',
                                        'No templates available yet'
                                    )}
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    {t(
                                        'template.createInSettings',
                                        'Create templates in Settings'
                                    )}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {templates.map((template) => {
                                    const items =
                                        template.items || template.Items || [];
                                    return (
                                        <button
                                            key={template.id}
                                            onClick={() =>
                                                handleApply(
                                                    template.id!,
                                                    template.name
                                                )
                                            }
                                            disabled={applying}
                                            className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors disabled:opacity-50"
                                        >
                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                {template.name}
                                            </div>
                                            {template.description && (
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {template.description}
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                {items.length}{' '}
                                                {t('template.items', 'items')}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                                {t('common.close', 'Close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ApplyTemplateButton;
