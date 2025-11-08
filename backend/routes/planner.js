const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../models');

/**
 * Smart Daily Planner Algorithm
 *
 * This endpoint analyzes the current time context and user's work schedule
 * to suggest the most appropriate tasks to work on right now.
 *
 * Factors considered:
 * 1. Current time of day (morning/afternoon/evening)
 * 2. User's work schedule (work days and hours)
 * 3. Task when_time preference
 * 4. Task energy_level requirements
 * 5. Natural energy patterns (high in morning, medium afternoon, low evening)
 * 6. Task priority
 * 7. Due dates
 */

// Helper: Get current time context
function getTimeContext(now = new Date()) {
    const hour = now.getHours();

    // Determine time of day
    let timeOfDay;
    if (hour >= 5 && hour < 12) {
        timeOfDay = 'morning';
    } else if (hour >= 12 && hour < 17) {
        timeOfDay = 'afternoon';
    } else {
        timeOfDay = 'evening';
    }

    // Map time of day to typical energy level
    const energyByTime = {
        morning: 'high',
        afternoon: 'medium',
        evening: 'low',
    };

    return {
        hour,
        timeOfDay,
        typicalEnergy: energyByTime[timeOfDay],
        dayOfWeek: now.getDay(), // 0 = Sunday, 1 = Monday, etc.
    };
}

// Helper: Check if current time is within work hours
function isWorkTime(timeContext, workSchedule) {
    const { dayOfWeek, hour } = timeContext;
    const { work_days, work_hours_start, work_hours_end } = workSchedule;

    // Check if today is a work day
    if (!work_days || !work_days.includes(dayOfWeek)) {
        return false;
    }

    // Parse work hours (format: "HH:MM")
    const startHour = work_hours_start ? parseInt(work_hours_start.split(':')[0]) : 9;
    const endHour = work_hours_end ? parseInt(work_hours_end.split(':')[0]) : 17;

    return hour >= startHour && hour < endHour;
}

// Helper: Score a task based on current context
function scoreTask(task, timeContext, workSchedule) {
    let score = 0;

    // Base score from priority (high=3, medium=2, low=1, null=1)
    const priorityScores = { high: 3, medium: 2, low: 1 };
    score += priorityScores[task.priority] || 1;

    // Bonus for matching when_time
    if (task.when_time) {
        if (task.when_time === timeContext.timeOfDay) {
            score += 5; // Perfect match
        } else if (task.when_time === 'anytime') {
            score += 2; // Flexible
        }
    } else {
        // No preference = anytime
        score += 2;
    }

    // Bonus for matching energy_level
    if (task.energy_level) {
        if (task.energy_level === timeContext.typicalEnergy) {
            score += 5; // Perfect match
        } else {
            // Partial match logic: high energy tasks in low energy time = penalty
            const energyValues = { low: 1, medium: 2, high: 3 };
            const taskEnergy = energyValues[task.energy_level] || 2;
            const currentEnergy = energyValues[timeContext.typicalEnergy] || 2;

            if (taskEnergy > currentEnergy) {
                score -= 2; // Task requires more energy than we have
            } else {
                score += 1; // Task requires less energy (doable but not optimal)
            }
        }
    } else {
        // No energy requirement = flexible
        score += 1;
    }

    // Bonus for due soon (within 3 days)
    if (task.due_date) {
        const dueDate = new Date(task.due_date);
        const now = new Date();
        const daysUntilDue = Math.floor((dueDate - now) / (1000 * 60 * 60 * 24));

        if (daysUntilDue < 0) {
            score += 10; // Overdue - highest priority
        } else if (daysUntilDue <= 1) {
            score += 7; // Due today or tomorrow
        } else if (daysUntilDue <= 3) {
            score += 4; // Due within 3 days
        }
    }

    // Small bonus for being in today plan
    if (task.today) {
        score += 3;
    }

    return score;
}

/**
 * GET /api/planner/suggest
 *
 * Returns suggested tasks based on current time and energy context
 */
router.get('/planner/suggest', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user's work schedule
        const user = await db.User.findByPk(userId, {
            attributes: ['work_days', 'work_hours_start', 'work_hours_end', 'work_hours_per_day'],
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get current time context
        const timeContext = getTimeContext();
        const workSchedule = {
            work_days: user.work_days,
            work_hours_start: user.work_hours_start,
            work_hours_end: user.work_hours_end,
        };

        const inWorkHours = isWorkTime(timeContext, workSchedule);

        // Fetch eligible tasks (not completed, not archived)
        const tasks = await db.Task.findAll({
            where: {
                user_id: userId,
                status: {
                    [db.Sequelize.Op.in]: [0, 1], // not_started or in_progress
                },
                parent_task_id: null, // Only parent tasks (not subtasks)
            },
            include: [
                {
                    model: db.Tag,
                    as: 'tags',
                    through: { attributes: [] },
                },
                {
                    model: db.Project,
                    as: 'Project',
                },
            ],
            order: [['created_at', 'DESC']],
        });

        // Score each task
        const scoredTasks = tasks.map((task) => ({
            task: task.toJSON(),
            score: scoreTask(task, timeContext, workSchedule),
        }));

        // Sort by score (highest first)
        scoredTasks.sort((a, b) => b.score - a.score);

        // Return top suggestions (max 10)
        const suggestions = scoredTasks.slice(0, 10).map((item) => item.task);

        res.json({
            context: {
                timeOfDay: timeContext.timeOfDay,
                typicalEnergy: timeContext.typicalEnergy,
                inWorkHours,
                hour: timeContext.hour,
            },
            suggestions,
        });
    } catch (error) {
        console.error('Error generating task suggestions:', error);
        res.status(500).json({ error: 'Failed to generate suggestions' });
    }
});

module.exports = router;
