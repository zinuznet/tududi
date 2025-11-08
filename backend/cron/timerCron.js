const { TimeEntry, User, Task, sequelize } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

/**
 * CRON Job: Auto-pause inactive timers
 *
 * Runs every 5 minutes to check for timers that have been running longer
 * than the user's configured auto_pause threshold with no recent activity.
 *
 * For ADHD users who forget to stop their timers.
 */
async function autoPauseInactiveTimers() {
    console.log('🔄 [CRON] Auto-pause: Checking for inactive timers...');

    try {
        // Find all active time entries (not stopped)
        const activeEntries = await TimeEntry.findAll({
            where: {
                stopped_at: null,
            },
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'timer_auto_pause_minutes', 'timer_notification_enabled'],
                    required: true,
                },
                {
                    model: Task,
                    as: 'Task',
                    attributes: ['id', 'uid', 'name', 'updated_at'],
                    required: true,
                },
            ],
        });

        if (activeEntries.length === 0) {
            console.log('✅ [CRON] Auto-pause: No active timers found');
            return;
        }

        console.log(`🔍 [CRON] Auto-pause: Found ${activeEntries.length} active timer(s)`);

        let pausedCount = 0;
        const now = new Date();

        for (const entry of activeEntries) {
            const user = entry.User;
            const task = entry.Task;

            // Get user's auto-pause threshold (default 30 minutes)
            const autoPauseMinutes = user.timer_auto_pause_minutes || 30;
            const thresholdMs = autoPauseMinutes * 60 * 1000;

            // Calculate how long timer has been running
            const startedAt = new Date(entry.started_at);
            const elapsedMs = now - startedAt;

            // Check if task has recent activity (updated_at is recent)
            const lastActivityAt = new Date(task.updated_at);
            const inactiveMs = now - lastActivityAt;

            // Only auto-pause if:
            // 1. Timer has been running for at least the threshold
            // 2. No activity on the task for at least the threshold
            if (elapsedMs >= thresholdMs && inactiveMs >= thresholdMs) {
                // Auto-pause the timer
                const durationSeconds = Math.floor(elapsedMs / 1000);

                await entry.update({
                    stopped_at: now,
                    duration_seconds: durationSeconds,
                });

                await task.update({
                    status: Task.STATUS.NOT_STARTED, // or keep as IN_PROGRESS if preferred
                    timer_started_at: null,
                });

                pausedCount++;

                console.log(
                    `⏸️  [CRON] Auto-pause: Paused timer for task "${task.name}" (${task.uid}) after ${Math.floor(
                        elapsedMs / 60000
                    )} minutes of inactivity`
                );

                // Note: Browser notifications would be sent from frontend
                // This is just the backend auto-pause logic
            }
        }

        if (pausedCount > 0) {
            console.log(`✅ [CRON] Auto-pause: Paused ${pausedCount} timer(s)`);
        } else {
            console.log('✅ [CRON] Auto-pause: No timers needed pausing');
        }
    } catch (error) {
        console.error('❌ [CRON] Auto-pause: Error:', error.message);
        console.error(error.stack);
    }
}

/**
 * Initialize and start the CRON job
 * Runs every 5 minutes
 */
function startTimerCronJobs() {
    console.log('🚀 [CRON] Timer jobs initialized');

    // Run immediately on startup
    autoPauseInactiveTimers();

    // Then run every 5 minutes
    const FIVE_MINUTES = 5 * 60 * 1000;
    setInterval(autoPauseInactiveTimers, FIVE_MINUTES);

    console.log('⏰ [CRON] Auto-pause job scheduled (every 5 minutes)');
}

module.exports = {
    startTimerCronJobs,
    autoPauseInactiveTimers, // Export for testing
};
