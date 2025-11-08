'use strict';

const { safeAddColumns } = require('../utils/migration-utils');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await safeAddColumns(queryInterface, 'projects', [
            {
                name: 'default_task_hours',
                definition: {
                    type: Sequelize.DECIMAL(5, 2),
                    allowNull: true,
                    defaultValue: 2.0,
                    comment: 'Default estimated hours for new tasks in this project',
                },
            },
            {
                name: 'time_tolerance_percent',
                definition: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    defaultValue: 50,
                    comment: 'Budget tolerance percentage (e.g., 50 = 50% buffer)',
                },
            },
            {
                name: 'hourly_rate',
                definition: {
                    type: Sequelize.DECIMAL(8, 2),
                    allowNull: true,
                    defaultValue: null,
                    comment: 'Hourly billing rate for financial calculations (optional)',
                },
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        const { safeRemoveColumn } = require('../utils/migration-utils');

        await safeRemoveColumn(queryInterface, 'projects', 'hourly_rate');
        await safeRemoveColumn(queryInterface, 'projects', 'time_tolerance_percent');
        await safeRemoveColumn(queryInterface, 'projects', 'default_task_hours');
    },
};
