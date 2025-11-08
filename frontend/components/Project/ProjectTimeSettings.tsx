import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClockIcon, CurrencyDollarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Project } from '../../entities/Project';
import { useToast } from '../Shared/ToastContext';

interface ProjectTimeSettingsProps {
    project: Project;
    onUpdate: (updatedProject: Project) => void;
}

const ProjectTimeSettings: React.FC<ProjectTimeSettingsProps> = ({
    project,
    onUpdate,
}) => {
    const { t } = useTranslation();
    const { showSuccessToast, showErrorToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        default_task_hours: project.default_task_hours || 2.0,
        time_tolerance_percent: project.time_tolerance_percent || 50,
        hourly_rate: project.hourly_rate || null,
    });

    const handleSave = async () => {
        try {
            const response = await fetch(`/api/project/${project.id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    default_task_hours: formData.default_task_hours,
                    time_tolerance_percent: formData.time_tolerance_percent,
                    hourly_rate: formData.hourly_rate || null,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update project settings');
            }

            const updatedProject = await response.json();
            onUpdate(updatedProject);
            setIsEditing(false);
            showSuccessToast(
                t('project.settingsUpdated', 'Project time settings updated')
            );
        } catch (error) {
            console.error('Error updating project settings:', error);
            showErrorToast(
                t('project.settingsUpdateError', 'Failed to update settings')
            );
        }
    };

    const handleCancel = () => {
        setFormData({
            default_task_hours: project.default_task_hours || 2.0,
            time_tolerance_percent: project.time_tolerance_percent || 50,
            hourly_rate: project.hourly_rate || null,
        });
        setIsEditing(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    {t('project.timeSettings', 'Time Tracking Settings')}
                </h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {t('common.edit', 'Edit')}
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {/* Default Task Hours */}
                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <ClockIcon className="h-4 w-4 mr-1.5" />
                        {t('project.defaultTaskHours', 'Default Task Hours')}
                    </label>
                    {isEditing ? (
                        <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            value={formData.default_task_hours}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    default_task_hours: parseFloat(e.target.value),
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                    ) : (
                        <p className="text-gray-900 dark:text-gray-100">
                            {project.default_task_hours || 2.0} hours
                        </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t(
                            'project.defaultTaskHoursHelp',
                            'Estimated hours for new tasks without custom estimates'
                        )}
                    </p>
                </div>

                {/* Time Tolerance */}
                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <ChartBarIcon className="h-4 w-4 mr-1.5" />
                        {t('project.timeTolerance', 'Budget Tolerance')}
                    </label>
                    {isEditing ? (
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                step="5"
                                min="0"
                                max="200"
                                value={formData.time_tolerance_percent}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        time_tolerance_percent: parseInt(
                                            e.target.value
                                        ),
                                    })
                                }
                                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                            <span className="text-gray-600 dark:text-gray-400">%</span>
                        </div>
                    ) : (
                        <p className="text-gray-900 dark:text-gray-100">
                            {project.time_tolerance_percent || 50}%
                        </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t(
                            'project.timeToleranceHelp',
                            'Buffer percentage above estimates (e.g., 50% = 50% extra time allowed)'
                        )}
                    </p>
                </div>

                {/* Hourly Rate */}
                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1.5" />
                        {t('project.hourlyRate', 'Hourly Rate (Optional)')}
                    </label>
                    {isEditing ? (
                        <input
                            type="number"
                            step="1"
                            min="0"
                            placeholder="0.00"
                            value={formData.hourly_rate || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    hourly_rate: e.target.value
                                        ? parseFloat(e.target.value)
                                        : null,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                    ) : (
                        <p className="text-gray-900 dark:text-gray-100">
                            {project.hourly_rate
                                ? `$${project.hourly_rate.toFixed(2)}/hour`
                                : t('common.notSet', 'Not set')}
                        </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t(
                            'project.hourlyRateHelp',
                            'For financial projections and profit calculations'
                        )}
                    </p>
                </div>

                {/* Edit Buttons */}
                {isEditing && (
                    <div className="flex justify-end space-x-2 pt-2">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            {t('common.cancel', 'Cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            {t('common.save', 'Save')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectTimeSettings;
