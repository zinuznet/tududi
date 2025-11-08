import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    DocumentArrowDownIcon,
    CalendarIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import { Project } from '../../entities/Project';
import { useToast } from '../Shared/ToastContext';

interface ProjectTimeReportProps {
    project: Project;
}

interface TimeReportSummary {
    total_entries: number;
    total_hours: number;
    total_cost: number | null;
    budget_remaining: number | null;
    budget_percentage: number | null;
}

interface TimeReportEntry {
    entry_id: number;
    task_uid: string;
    task_name: string;
    user_name: string;
    started_at: string;
    stopped_at: string;
    duration_hours: number;
    is_manual: boolean;
    note: string | null;
}

interface TimeReport {
    project: {
        uid: string;
        name: string;
        estimated_hours: number | null;
        hourly_rate: number | null;
    };
    filters: {
        start_date: string | null;
        end_date: string | null;
    };
    summary: TimeReportSummary;
    entries: TimeReportEntry[];
}

const ProjectTimeReport: React.FC<ProjectTimeReportProps> = ({ project }) => {
    const { t } = useTranslation();
    const { showSuccessToast, showErrorToast } = useToast();

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<TimeReport | null>(null);

    // Format date for display
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    };

    // Format hours for display
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

    // Generate report (fetch data)
    const handleGenerateReport = async () => {
        if (!project.uid) return;

        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            params.append('format', 'json');

            const response = await fetch(
                `/api/project/${project.uid}/time-report?${params.toString()}`,
                {
                    credentials: 'include',
                    headers: { Accept: 'application/json' },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            const data: TimeReport = await response.json();
            setReport(data);
            showSuccessToast(t('timeReport.generated', 'Report generated successfully'));
        } catch (error) {
            console.error('Error generating report:', error);
            showErrorToast(t('timeReport.error', 'Failed to generate report'));
        } finally {
            setLoading(false);
        }
    };

    // Download as CSV
    const handleDownloadCSV = async () => {
        if (!project.uid) return;

        try {
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            params.append('format', 'csv');

            const response = await fetch(
                `/api/project/${project.uid}/time-report?${params.toString()}`,
                {
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error('Failed to download CSV');
            }

            // Create a blob from the response
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `time-report-${project.uid}-${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showSuccessToast(t('timeReport.downloaded', 'CSV report downloaded'));
        } catch (error) {
            console.error('Error downloading CSV:', error);
            showErrorToast(t('timeReport.downloadError', 'Failed to download CSV'));
        }
    };

    // Download as JSON
    const handleDownloadJSON = () => {
        if (!report) return;

        const dataStr = JSON.stringify(report, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `time-report-${project.uid}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showSuccessToast(t('timeReport.downloaded', 'JSON report downloaded'));
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                {t('timeReport.title', 'Time Report')}
            </h3>

            {/* Date Range Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <CalendarIcon className="h-4 w-4 inline mr-1" />
                        {t('timeReport.startDate', 'Start Date')}
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <CalendarIcon className="h-4 w-4 inline mr-1" />
                        {t('timeReport.endDate', 'End Date')}
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={handleGenerateReport}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                    <ClockIcon className="h-4 w-4" />
                    {loading
                        ? t('timeReport.generating', 'Generating...')
                        : t('timeReport.generate', 'Generate Report')}
                </button>

                {report && (
                    <>
                        <button
                            onClick={handleDownloadCSV}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 transition-colors"
                        >
                            <DocumentArrowDownIcon className="h-4 w-4" />
                            {t('timeReport.downloadCSV', 'Download CSV')}
                        </button>
                        <button
                            onClick={handleDownloadJSON}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2 transition-colors"
                        >
                            <DocumentArrowDownIcon className="h-4 w-4" />
                            {t('timeReport.downloadJSON', 'Download JSON')}
                        </button>
                    </>
                )}
            </div>

            {/* Report Summary */}
            {report && (
                <div className="space-y-4">
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
                            {t('timeReport.summary', 'Summary')}
                        </h4>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {t('timeReport.totalEntries', 'Total Entries')}
                                </div>
                                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                    {report.summary.total_entries}
                                </div>
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {t('timeReport.totalHours', 'Total Hours')}
                                </div>
                                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                                    {formatHours(report.summary.total_hours)}
                                </div>
                            </div>

                            {report.summary.total_cost !== null && (
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('timeReport.totalCost', 'Total Cost')}
                                    </div>
                                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                        ${report.summary.total_cost.toFixed(2)}
                                    </div>
                                </div>
                            )}

                            {report.summary.budget_remaining !== null && (
                                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('timeReport.budgetRemaining', 'Budget Remaining')}
                                    </div>
                                    <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                        {formatHours(report.summary.budget_remaining)}
                                    </div>
                                </div>
                            )}

                            {report.summary.budget_percentage !== null && (
                                <div
                                    className={`p-3 rounded-lg ${
                                        report.summary.budget_percentage > 100
                                            ? 'bg-red-50 dark:bg-red-900/20'
                                            : report.summary.budget_percentage > 80
                                            ? 'bg-yellow-50 dark:bg-yellow-900/20'
                                            : 'bg-green-50 dark:bg-green-900/20'
                                    }`}
                                >
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('timeReport.budgetUsed', 'Budget Used')}
                                    </div>
                                    <div
                                        className={`text-xl font-bold ${
                                            report.summary.budget_percentage > 100
                                                ? 'text-red-600 dark:text-red-400'
                                                : report.summary.budget_percentage > 80
                                                ? 'text-yellow-600 dark:text-yellow-400'
                                                : 'text-green-600 dark:text-green-400'
                                        }`}
                                    >
                                        {report.summary.budget_percentage.toFixed(1)}%
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Entries Preview */}
                    {report.entries.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                {t('timeReport.recentEntries', 'Recent Entries')}{' '}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                    (showing {Math.min(5, report.entries.length)} of{' '}
                                    {report.entries.length})
                                </span>
                            </h4>

                            <div className="space-y-2">
                                {report.entries.slice(0, 5).map((entry) => (
                                    <div
                                        key={entry.entry_id}
                                        className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                {entry.task_name}
                                            </div>
                                            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                {formatHours(entry.duration_hours)}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {entry.user_name} •{' '}
                                            {formatDate(entry.started_at)}
                                            {entry.is_manual && (
                                                <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                                                    Manual
                                                </span>
                                            )}
                                        </div>
                                        {entry.note && (
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
                                                "{entry.note}"
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {report.entries.length > 5 && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
                                    {t(
                                        'timeReport.downloadForFull',
                                        'Download the full report to see all entries'
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Empty State */}
                    {report.entries.length === 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-center text-gray-500 dark:text-gray-400">
                            {t(
                                'timeReport.noEntries',
                                'No time entries found for the selected date range.'
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjectTimeReport;
