const { Task, TimeEntry, Project } = require('../models');
const { Op } = require('sequelize');

/**
 * Calculate comprehensive time tracking metrics for a project
 * Helps users with ADHD plan and track project budgets
 *
 * @param {number} projectId - Project ID
 * @param {number} userId - User ID (for permission checks)
 * @returns {Promise<Object>} Project metrics object
 */
async function calculateProjectMetrics(projectId, userId) {
    // Fetch project with settings
    const project = await Project.findOne({
        where: { id: projectId },
        attributes: [
            'id',
            'uid',
            'name',
            'default_task_hours',
            'time_tolerance_percent',
            'hourly_rate',
        ],
    });

    if (!project) {
        throw new Error('Project not found');
    }

    // Fetch all tasks for this project (exclude archived tasks from split)
    const tasks = await Task.findAll({
        where: {
            project_id: projectId,
            user_id: userId,
            // Exclude subtasks (time tracked on parent)
            parent_task_id: null,
        },
        attributes: [
            'id',
            'name',
            'status',
            'estimated_hours',
            'due_date',
            'priority',
        ],
        include: [
            {
                model: TimeEntry,
                as: 'TimeEntries',
                attributes: ['duration_seconds'],
                where: { stopped_at: { [Op.ne]: null } }, // Only completed entries
                required: false,
            },
        ],
    });

    // 1. ESTIMATION - Calculate total estimated hours
    const defaultHours = project.default_task_hours || 2.0;
    const totalEstimated = tasks.reduce((sum, task) => {
        const taskEstimate = task.estimated_hours || defaultHours;
        return sum + parseFloat(taskEstimate);
    }, 0);

    // 2. BUDGET - Calculate budget with tolerance
    const tolerancePercent = project.time_tolerance_percent || 50;
    const budgetWithTolerance =
        totalEstimated * (1 + tolerancePercent / 100);

    // 3. ACTUAL TIME - Calculate actual time spent on DONE tasks
    const doneTasks = tasks.filter((t) => t.status === Task.STATUS.DONE);
    const actualSpent = doneTasks.reduce((sum, task) => {
        if (!task.TimeEntries || task.TimeEntries.length === 0) return sum;

        const taskActualSeconds = task.TimeEntries.reduce(
            (tSum, entry) => tSum + (entry.duration_seconds || 0),
            0
        );
        return sum + taskActualSeconds / 3600; // Convert to hours
    }, 0);

    // 4. AVERAGE - Calculate average actual time per task
    const avgActual =
        doneTasks.length > 0 ? actualSpent / doneTasks.length : defaultHours;

    // 5. PROJECTION - Calculate projected total time
    const notStartedTasks = tasks.filter(
        (t) => t.status === Task.STATUS.NOT_STARTED
    );
    const inProgressTasks = tasks.filter(
        (t) => t.status === Task.STATUS.IN_PROGRESS
    );
    const waitingTasks = tasks.filter((t) => t.status === Task.STATUS.WAITING);

    const remainingTasksCount =
        notStartedTasks.length + inProgressTasks.length + waitingTasks.length;
    const projectedRemaining = remainingTasksCount * avgActual;
    const projectedTotal = actualSpent + projectedRemaining;

    // 6. HEALTH STATUS - Determine project health
    let healthStatus;
    if (projectedTotal <= totalEstimated) {
        healthStatus = 'green'; // Within original estimate
    } else if (projectedTotal <= budgetWithTolerance) {
        healthStatus = 'yellow'; // Over estimate but within tolerance
    } else {
        healthStatus = 'red'; // Over budget!
    }

    // 7. TIME REMAINING
    const timeRemaining = budgetWithTolerance - actualSpent;
    const isOverBudget = projectedTotal > budgetWithTolerance;

    // 8. TASK BREAKDOWN
    const taskBreakdown = {
        total: tasks.length,
        notStarted: notStartedTasks.length,
        inProgress: inProgressTasks.length,
        waiting: waitingTasks.length,
        done: doneTasks.length,
        archived: tasks.filter((t) => t.status === Task.STATUS.ARCHIVED).length,
    };

    // 9. FINANCIAL METRICS (if hourly_rate is set)
    let financial = null;
    if (project.hourly_rate) {
        const rate = parseFloat(project.hourly_rate);
        const revenue = budgetWithTolerance * rate;
        const cost = projectedTotal * rate;
        const profit = revenue - cost;
        const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

        financial = {
            hourly_rate: rate,
            revenue: parseFloat(revenue.toFixed(2)),
            cost: parseFloat(cost.toFixed(2)),
            profit: parseFloat(profit.toFixed(2)),
            profit_margin_percent: parseFloat(profitMargin.toFixed(2)),
            is_profitable: profit > 0,
        };
    }

    // 10. VARIANCE ANALYSIS
    const variance = actualSpent - totalEstimated;
    const variancePercent =
        totalEstimated > 0 ? (variance / totalEstimated) * 100 : 0;

    // 11. TASKS OVER BUDGET
    const tasksOverBudget = doneTasks.filter((task) => {
        const estimate = task.estimated_hours || defaultHours;
        const actual = task.TimeEntries.reduce(
            (sum, entry) => sum + (entry.duration_seconds || 0) / 3600,
            0
        );
        return actual > estimate * 1.5; // 50% over estimate
    });

    return {
        project: {
            id: project.id,
            uid: project.uid,
            name: project.name,
            default_task_hours: defaultHours,
            time_tolerance_percent: tolerancePercent,
        },
        estimation: {
            total_estimated_hours: parseFloat(totalEstimated.toFixed(2)),
            budget_with_tolerance_hours: parseFloat(
                budgetWithTolerance.toFixed(2)
            ),
            tolerance_percent: tolerancePercent,
        },
        actual: {
            total_spent_hours: parseFloat(actualSpent.toFixed(2)),
            average_per_task_hours: parseFloat(avgActual.toFixed(2)),
            completed_tasks_count: doneTasks.length,
        },
        projection: {
            remaining_tasks_count: remainingTasksCount,
            projected_remaining_hours: parseFloat(
                projectedRemaining.toFixed(2)
            ),
            projected_total_hours: parseFloat(projectedTotal.toFixed(2)),
        },
        budget: {
            time_remaining_hours: parseFloat(timeRemaining.toFixed(2)),
            is_over_budget: isOverBudget,
            variance_hours: parseFloat(variance.toFixed(2)),
            variance_percent: parseFloat(variancePercent.toFixed(2)),
        },
        health: {
            status: healthStatus, // 'green' | 'yellow' | 'red'
            message: getHealthMessage(healthStatus, isOverBudget, timeRemaining),
        },
        tasks: taskBreakdown,
        warnings: {
            tasks_over_budget_count: tasksOverBudget.length,
            tasks_over_budget: tasksOverBudget.map((t) => ({
                id: t.id,
                name: t.name,
            })),
        },
        financial,
    };
}

/**
 * Get human-readable health message
 */
function getHealthMessage(status, isOverBudget, timeRemaining) {
    if (status === 'green') {
        return `Project is on track. ${timeRemaining.toFixed(1)}h buffer remaining.`;
    } else if (status === 'yellow') {
        return `Project is close to budget limit. ${timeRemaining.toFixed(1)}h remaining.`;
    } else {
        return `Project is over budget! Exceeded by ${Math.abs(timeRemaining).toFixed(1)}h.`;
    }
}

/**
 * Get simple health status for a project (lightweight version)
 */
async function getProjectHealthStatus(projectId, userId) {
    const metrics = await calculateProjectMetrics(projectId, userId);
    return {
        status: metrics.health.status,
        is_over_budget: metrics.budget.is_over_budget,
        time_remaining: metrics.budget.time_remaining_hours,
    };
}

module.exports = {
    calculateProjectMetrics,
    getProjectHealthStatus,
};
