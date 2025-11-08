const { tableExists } = require('../utils/migration-utils');

/**
 * Migration 011b: Add Pomodoro Sessions tracking table
 *
 * Tracks completed and partial Pomodoro sessions for:
 * - Statistics and analytics
 * - Motivation through visible progress
 * - Pattern recognition
 *
 * ADHD Benefits:
 * - Gamification through session counting
 * - Visual progress ("I did 5 pomodoros today!")
 * - Streak tracking for consistency building
 */

async function up(queryInterface, Sequelize) {
    console.log('Running migration 011b: Create pomodoro_sessions table');

    const tableName = 'pomodoro_sessions';

    // Check if table already exists
    const exists = await tableExists(queryInterface, tableName);
    if (exists) {
        console.log(`⚠ Table ${tableName} already exists, skipping creation`);
        return;
    }

    // Create pomodoro_sessions table
    await queryInterface.createTable(tableName, {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        task_id: {
            type: Sequelize.INTEGER,
            allowNull: true, // Can have pomodoro without specific task
            references: {
                model: 'tasks',
                key: 'id',
            },
            onDelete: 'SET NULL',
        },
        started_at: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        completed_at: {
            type: Sequelize.DATE,
            allowNull: true, // Null if session was interrupted
        },
        work_minutes: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: 'Planned work duration in minutes',
        },
        break_minutes: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: 'Planned break duration in minutes',
        },
        session_type: {
            type: Sequelize.STRING(20),
            allowNull: false,
            defaultValue: 'work',
            comment: 'Type: work, short_break, long_break',
        },
        completed: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'True if session completed, false if interrupted',
        },
        created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
    });

    // Create indexes for performance
    await queryInterface.addIndex(tableName, ['user_id'], {
        name: 'idx_pomodoro_sessions_user_id',
    });

    await queryInterface.addIndex(tableName, ['task_id'], {
        name: 'idx_pomodoro_sessions_task_id',
    });

    await queryInterface.addIndex(tableName, ['user_id', 'started_at'], {
        name: 'idx_pomodoro_sessions_user_date',
    });

    await queryInterface.addIndex(tableName, ['completed'], {
        name: 'idx_pomodoro_sessions_completed',
    });

    console.log('✓ Created pomodoro_sessions table with indexes');
    console.log('✓ Migration 011b completed successfully');
}

async function down(queryInterface, Sequelize) {
    console.log('Reverting migration 011b: Drop pomodoro_sessions table');

    const tableName = 'pomodoro_sessions';

    // Check if table exists
    const exists = await tableExists(queryInterface, tableName);
    if (!exists) {
        console.log(`⚠ Table ${tableName} does not exist, skipping drop`);
        return;
    }

    // Drop table
    await queryInterface.dropTable(tableName);
    console.log('✓ Dropped pomodoro_sessions table');
    console.log('✓ Migration 011b reverted successfully');
}

module.exports = { up, down };
