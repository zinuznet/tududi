import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ChartBarIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    CurrencyDollarIcon,
    ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { Project } from '../../entities/Project';
import { ProjectMetrics, fetchProjectMetrics } from '../../utils/projectsService';
import { useToast } from '../Shared/ToastContext';

interface ProjectMetricsPanelProps {
    project: Project;
}

const ProjectMetricsPanel: React.FC<ProjectMetricsPanelProps> = ({ project }) => {
    const { t } = useTranslation();
    const { showErrorToast } = useToast();
    const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMetrics();
    }, [project.id]);

    const loadMetrics = async () => {
        if (!project.id) return;

        try {
            setLoading(true);
            const data = await fetchProjectMetrics(project.id);
            setMetrics(data);
        } catch (error) {
            console.error('Error loading project metrics:', error);
            showErrorToast(
                t('project.metricsLoadError', 'Failed to load project metrics')
            );
        } finally {
            setLoading(false);
        }
    };

    const getHealthBadgeColor = (status: 'green' | 'yellow' | 'red') => {
        switch (status) {
            case 'green':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
            case 'yellow':
                return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
            case 'red':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
        }
    };

    const getProgressBarColor = (status: 'green' | 'yellow' | 'red') => {
        switch (status) {
            case 'green':
                return 'bg-green-500';
            case 'yellow':
                return 'bg-yellow-500';
            case 'red':
                return 'bg-red-500';
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!metrics) {
        return null;
    }

    const progressPercent = (metrics.estimation?.total_estimated_hours || 0) > 0
        ? Math.min(
              100,
              ((metrics.projection?.projected_total_hours || 0) /
                  (metrics.budget?.total_budget_hours || 1)) *
                  100
          )
        : 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    {t('project.timeMetrics', 'Project Time Metrics')}
                </h3>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getHealthBadgeColor(
                        metrics.health.status
                    )}`}
                >
                    {metrics.health.status.toUpperCase()}
                </span>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Estimated */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <ClockIcon className="h-3.5 w-3.5 mr-1" />
                        {t('project.estimated', 'Estimated')}
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        {(metrics.estimation.total_estimated_hours || 0).toFixed(1)}h
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {metrics.estimation.tasks_with_estimates || 0} tasks
                    </div>
                </div>

                {/* Actual Spent */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                        {t('project.actualSpent', 'Actual Spent')}
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        {(metrics.actual.total_actual_hours || 0).toFixed(1)}h
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {metrics.actual.completed_tasks || 0} completed
                    </div>
                </div>

                {/* Projected Total */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <ArrowTrendingUpIcon className="h-3.5 w-3.5 mr-1" />
                        {t('project.projected', 'Projected Total')}
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        {(metrics.projection.projected_total_hours || 0).toFixed(1)}h
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {metrics.projection.remaining_tasks || 0} remaining
                    </div>
                </div>

                {/* Budget with Tolerance */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <ChartBarIcon className="h-3.5 w-3.5 mr-1" />
                        {t('project.budget', 'Budget')}
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        {(metrics.budget.total_budget_hours || 0).toFixed(1)}h
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        +{metrics.budget.tolerance_percent || 0}% buffer
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <span>{t('project.budgetProgress', 'Budget Progress')}</span>
                    <span>{progressPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(
                            metrics.health.status
                        )}`}
                        style={{ width: `${Math.min(100, progressPercent)}%` }}
                    />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {metrics.health.message}
                </p>
            </div>

            {/* Variance */}
            {(metrics.projection?.variance_hours || 0) !== 0 && (
                <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('project.variance', 'Variance')}
                    </div>
                    <div className="flex items-center justify-between">
                        <span
                            className={`text-lg font-semibold ${
                                (metrics.projection?.variance_hours || 0) > 0
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-green-600 dark:text-green-400'
                            }`}
                        >
                            {(metrics.projection?.variance_hours || 0) > 0 ? '+' : ''}
                            {(metrics.projection?.variance_hours || 0).toFixed(1)}h
                        </span>
                        <span
                            className={`text-sm ${
                                (metrics.projection?.variance_hours || 0) > 0
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-green-600 dark:text-green-400'
                            }`}
                        >
                            ({(metrics.projection?.variance_percent || 0) > 0 ? '+' : ''}
                            {(metrics.projection?.variance_percent || 0).toFixed(0)}%)
                        </span>
                    </div>
                </div>
            )}

            {/* Financial Metrics */}
            {metrics.financial && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1.5" />
                        {t('project.financialProjection', 'Financial Projection')}
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-700 dark:text-gray-300">
                                {t('project.revenue', 'Revenue (Budget)')}:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                ${metrics.financial.estimated_revenue.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-700 dark:text-gray-300">
                                {t('project.cost', 'Cost (Projected)')}:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                ${metrics.financial.projected_cost.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-800">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {t('project.profit', 'Profit')}:
                            </span>
                            <span
                                className={`font-semibold ${
                                    metrics.financial.is_profitable
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                }`}
                            >
                                ${metrics.financial.projected_profit.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Warnings */}
            {metrics.warnings.length > 0 && (
                <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('project.warnings', 'Warnings')}
                    </div>
                    {metrics.warnings.map((warning, index) => (
                        <div
                            key={index}
                            className="flex items-start p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                        >
                            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-amber-900 dark:text-amber-100">
                                {warning}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Average per Task */}
            {metrics.actual.completed_tasks > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('project.averagePerTask', 'Average per completed task')}:{' '}
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {metrics.actual.average_actual_hours.toFixed(1)}h
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectMetricsPanel;
