const { addColumnIfNotExists } = require('../utils/migration-helpers');

/**
 * Migration 011: Add Pomodoro Timer settings to User model
 *
 * Adds configurable Pomodoro Technique settings:
 * - Work session duration (default 25 minutes)
 * - Short break duration (default 5 minutes)
 * - Long break duration (default 15 minutes)
 * - Number of sessions until long break (default 4)
 *
 * ADHD Benefits:
 * - Customizable to individual focus capacity
 * - Short sessions prevent overwhelm
 * - Forced breaks prevent burnout
 */

async function up(queryInterface, Sequelize) {
    console.log('Running migration 011: Add Pomodoro settings to users table');

    const tableName = 'users';

    // Add pomodoro_work_minutes (default 25 minutes)
    await addColumnIfNotExists(queryInterface, tableName, 'pomodoro_work_minutes', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 25,
    });
    console.log('✓ Added pomodoro_work_minutes column');

    // Add pomodoro_short_break_minutes (default 5 minutes)
    await addColumnIfNotExists(queryInterface, tableName, 'pomodoro_short_break_minutes', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5,
    });
    console.log('✓ Added pomodoro_short_break_minutes column');

    // Add pomodoro_long_break_minutes (default 15 minutes)
    await addColumnIfNotExists(queryInterface, tableName, 'pomodoro_long_break_minutes', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 15,
    });
    console.log('✓ Added pomodoro_long_break_minutes column');

    // Add pomodoro_sessions_until_long_break (default 4)
    await addColumnIfNotExists(queryInterface, tableName, 'pomodoro_sessions_until_long_break', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 4,
    });
    console.log('✓ Added pomodoro_sessions_until_long_break column');

    console.log('✓ Migration 011 completed successfully');
}

async function down(queryInterface, Sequelize) {
    console.log('Reverting migration 011: Remove Pomodoro settings from users table');

    const tableName = 'users';

    // Remove columns if they exist
    try {
        await queryInterface.removeColumn(tableName, 'pomodoro_work_minutes');
        console.log('✓ Removed pomodoro_work_minutes column');
    } catch (error) {
        console.log('⚠ Column pomodoro_work_minutes does not exist, skipping');
    }

    try {
        await queryInterface.removeColumn(tableName, 'pomodoro_short_break_minutes');
        console.log('✓ Removed pomodoro_short_break_minutes column');
    } catch (error) {
        console.log('⚠ Column pomodoro_short_break_minutes does not exist, skipping');
    }

    try {
        await queryInterface.removeColumn(tableName, 'pomodoro_long_break_minutes');
        console.log('✓ Removed pomodoro_long_break_minutes column');
    } catch (error) {
        console.log('⚠ Column pomodoro_long_break_minutes does not exist, skipping');
    }

    try {
        await queryInterface.removeColumn(tableName, 'pomodoro_sessions_until_long_break');
        console.log('✓ Removed pomodoro_sessions_until_long_break column');
    } catch (error) {
        console.log('⚠ Column pomodoro_sessions_until_long_break does not exist, skipping');
    }

    console.log('✓ Migration 011 reverted successfully');
}

module.exports = { up, down };
