/**
 * Browser Notification Service
 *
 * Handles browser notifications for timer reminders and auto-pause alerts.
 * Designed for ADHD users to help them stay aware of active timers.
 */

export type NotificationType = 'timer_reminder' | 'timer_auto_pause' | 'timer_started' | 'timer_stopped';

interface NotificationOptions {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
}

class NotificationService {
    private permission: NotificationPermission = 'default';
    private reminderIntervals: Map<number, NodeJS.Timeout> = new Map();

    constructor() {
        this.checkPermission();
    }

    /**
     * Check current notification permission status
     */
    private checkPermission() {
        if ('Notification' in window) {
            this.permission = Notification.permission;
        }
    }

    /**
     * Request notification permission from user
     */
    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('Browser does not support notifications');
            return false;
        }

        if (this.permission === 'granted') {
            return true;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    /**
     * Show a notification
     */
    private async show(options: NotificationOptions): Promise<Notification | null> {
        if (!('Notification' in window)) {
            console.warn('Browser does not support notifications');
            return null;
        }

        if (this.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return null;
        }

        try {
            const notification = new Notification(options.title, {
                body: options.body,
                icon: options.icon || '/favicon.ico',
                tag: options.tag,
                requireInteraction: options.requireInteraction || false,
                badge: '/favicon.ico',
            });

            // Auto-close after 10 seconds unless requireInteraction is true
            if (!options.requireInteraction) {
                setTimeout(() => {
                    notification.close();
                }, 10000);
            }

            return notification;
        } catch (error) {
            console.error('Error showing notification:', error);
            return null;
        }
    }

    /**
     * Show generic notification (public wrapper for show)
     */
    async notify(options: NotificationOptions) {
        return await this.show(options);
    }

    /**
     * Show timer started notification
     */
    async notifyTimerStarted(taskName: string) {
        await this.show({
            title: 'Timer Started',
            body: `Timer started for "${taskName}"`,
            tag: 'timer-started',
        });
    }

    /**
     * Show timer stopped notification
     */
    async notifyTimerStopped(taskName: string, durationMinutes: number) {
        await this.show({
            title: 'Timer Stopped',
            body: `Timer stopped for "${taskName}" - Duration: ${durationMinutes} minutes`,
            tag: 'timer-stopped',
        });
    }

    /**
     * Show timer reminder notification
     */
    async notifyTimerReminder(taskName: string, elapsedMinutes: number) {
        const notification = await this.show({
            title: 'Timer Still Running',
            body: `Timer for "${taskName}" has been running for ${elapsedMinutes} minutes`,
            tag: 'timer-reminder',
            requireInteraction: false,
        });

        // Click notification to navigate to task
        if (notification) {
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    }

    /**
     * Show auto-pause notification
     */
    async notifyAutoPause(taskName: string, pausedAfterMinutes: number) {
        const notification = await this.show({
            title: 'Timer Auto-Paused',
            body: `Timer for "${taskName}" was automatically paused after ${pausedAfterMinutes} minutes of inactivity`,
            tag: 'timer-auto-pause',
            requireInteraction: true, // Require user to dismiss
        });

        // Click notification to navigate to task
        if (notification) {
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    }

    /**
     * Start periodic reminders for an active timer
     */
    startTimerReminders(
        taskId: number,
        taskName: string,
        intervalMinutes: number
    ) {
        // Clear existing reminder for this task
        this.stopTimerReminders(taskId);

        // Convert minutes to milliseconds
        const intervalMs = intervalMinutes * 60 * 1000;

        // Start reminder interval
        const intervalId = setInterval(async () => {
            // Calculate elapsed time (approximately)
            const elapsedMinutes = Math.floor(
                (Date.now() % (24 * 60 * 60 * 1000)) / (60 * 1000)
            );
            await this.notifyTimerReminder(taskName, intervalMinutes);
        }, intervalMs);

        this.reminderIntervals.set(taskId, intervalId);
        console.log(
            `🔔 Timer reminders started for task ${taskId} (every ${intervalMinutes} minutes)`
        );
    }

    /**
     * Stop periodic reminders for a timer
     */
    stopTimerReminders(taskId: number) {
        const intervalId = this.reminderIntervals.get(taskId);
        if (intervalId) {
            clearInterval(intervalId);
            this.reminderIntervals.delete(taskId);
            console.log(`🔕 Timer reminders stopped for task ${taskId}`);
        }
    }

    /**
     * Check if notifications are supported and enabled
     */
    isSupported(): boolean {
        return 'Notification' in window;
    }

    /**
     * Check if permission is granted
     */
    isGranted(): boolean {
        return this.permission === 'granted';
    }

    /**
     * Get current permission status
     */
    getPermission(): NotificationPermission {
        this.checkPermission();
        return this.permission;
    }
}

// Export singleton instance
export const notificationService = new NotificationService();
