'use strict';

const { safeAddColumns } = require('../utils/migration-utils');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await safeAddColumns(queryInterface, 'users', [
            {
                name: 'timer_auto_pause_minutes',
                definition: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 30,
                    comment: 'Auto-pause timer after X minutes of inactivity',
                },
            },
            {
                name: 'timer_reminder_interval_minutes',
                definition: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 30,
                    comment: 'Remind user every X minutes when timer is running',
                },
            },
            {
                name: 'timer_notification_enabled',
                definition: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                    comment: 'Enable browser notifications for timer events',
                },
            },
        ]);
    },

    async down(queryInterface) {
        const { safeRemoveColumn } = require('../utils/migration-utils');

        await safeRemoveColumn(queryInterface, 'users', 'timer_notification_enabled');
        await safeRemoveColumn(queryInterface, 'users', 'timer_reminder_interval_minutes');
        await safeRemoveColumn(queryInterface, 'users', 'timer_auto_pause_minutes');
    },
};
