'use strict';

const { safeAddColumns, safeAddIndex } = require('../utils/migration-utils');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await safeAddColumns(queryInterface, 'tasks', [
            {
                name: 'estimated_hours',
                definition: {
                    type: Sequelize.DECIMAL(5, 2),
                    allowNull: true,
                    defaultValue: null,
                    comment: 'Estimated hours to complete this task',
                },
            },
            {
                name: 'timer_started_at',
                definition: {
                    type: Sequelize.DATE,
                    allowNull: true,
                    defaultValue: null,
                    comment: 'When the current timer session started (NULL if not running)',
                },
            },
        ]);

        // Add index for timer queries (find active timers)
        await safeAddIndex(queryInterface, 'tasks', ['timer_started_at']);
        await safeAddIndex(queryInterface, 'tasks', ['user_id', 'timer_started_at']);
    },

    async down(queryInterface) {
        const { safeRemoveColumn } = require('../utils/migration-utils');

        await queryInterface.removeIndex('tasks', ['user_id', 'timer_started_at']);
        await queryInterface.removeIndex('tasks', ['timer_started_at']);
        await safeRemoveColumn(queryInterface, 'tasks', 'timer_started_at');
        await safeRemoveColumn(queryInterface, 'tasks', 'estimated_hours');
    },
};
