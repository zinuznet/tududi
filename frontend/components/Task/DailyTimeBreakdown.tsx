import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, FolderIcon } from '@heroicons/react/24/outline';
import { ProjectTimeBreakdown } from '../../entities/Metrics';

interface DailyTimeBreakdownProps {
    totalHours: number;
    projectBreakdown: ProjectTimeBreakdown[];
}

const DailyTimeBreakdown: React.FC<DailyTimeBreakdownProps> = ({
    totalHours,
    projectBreakdown,
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const formatHours = (hours: number): string => {
        if (hours === 0) return '0h 0m';

        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);

        if (h > 0 && m > 0) {
            return `${h}h ${m}m`;
        } else if (h > 0) {
            return `${h}h`;
        } else {
            return `${m}m`;
        }
    };

    const handleProjectClick = (projectUid: string | null) => {
        if (projectUid) {
            navigate(`/project/${projectUid}`);
        }
    };

    if (totalHours === 0 && projectBreakdown.length === 0) {
        return null;
    }

    return (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    {t('timer.todayTotal', "Today's Time")}
                </h3>
                <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                    {formatHours(totalHours)}
                </div>
            </div>

            {projectBreakdown.length > 0 && (
                <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        {t('timer.byProject', 'By Project')}
                    </div>
                    {projectBreakdown.map((project, index) => (
                        <div
                            key={project.project_id || 'no-project'}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                        >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="flex-shrink-0">
                                    {project.project_id ? (
                                        <FolderIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    ) : (
                                        <FolderIcon className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    {project.project_uid ? (
                                        <button
                                            onClick={() =>
                                                handleProjectClick(project.project_uid)
                                            }
                                            className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate text-left w-full"
                                        >
                                            {project.project_name}
                                        </button>
                                    ) : (
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 italic truncate">
                                            {project.project_name}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {project.task_count}{' '}
                                        {project.task_count === 1
                                            ? t('common.task', 'task')
                                            : t('common.tasks', 'tasks')}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-shrink-0 ml-4">
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {formatHours(project.total_hours)}
                                    </div>
                                    {totalHours > 0 && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {Math.round(
                                                (project.total_hours / totalHours) * 100
                                            )}
                                            %
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DailyTimeBreakdown;
