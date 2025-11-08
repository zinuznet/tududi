'use strict';

const { safeCreateTable, safeAddIndex } = require('../utils/migration-utils');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await safeCreateTable(queryInterface, 'time_entries', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            task_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'tasks',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                comment: 'Task this time entry belongs to',
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                comment: 'User who tracked this time',
            },
            started_at: {
                type: Sequelize.DATE,
                allowNull: false,
                comment: 'When this time tracking session started',
            },
            stopped_at: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: null,
                comment: 'When this session ended (NULL if timer still running)',
            },
            duration_seconds: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: null,
                comment: 'Total duration in seconds (calculated when stopped)',
            },
            note: {
                type: Sequelize.TEXT,
                allowNull: true,
                defaultValue: null,
                comment: 'Optional note about this time entry',
            },
            is_manual: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: 'True if manually created/edited (not from timer)',
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        // Add indexes for efficient queries
        await safeAddIndex(queryInterface, 'time_entries', ['task_id']);
        await safeAddIndex(queryInterface, 'time_entries', ['user_id']);
        await safeAddIndex(queryInterface, 'time_entries', ['started_at']);

        // Compound index for finding active timers per user
        await safeAddIndex(queryInterface, 'time_entries', ['user_id', 'stopped_at'], {
            name: 'idx_time_entries_user_active'
        });

        // Compound index for task time calculations
        await safeAddIndex(queryInterface, 'time_entries', ['task_id', 'stopped_at'], {
            name: 'idx_time_entries_task_completed'
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('time_entries');
    },
};
