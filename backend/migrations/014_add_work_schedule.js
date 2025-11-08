const { addColumnIfNotExists } = require('../utils/migration-helpers');

/**
 * Migration 014: Add Work Schedule Configuration
 *
 * Adds fields to User model for configuring work schedule:
 * - work_days: Which days of the week user works (JSON array)
 * - work_hours_start: Start of work day (HH:MM format)
 * - work_hours_end: End of work day (HH:MM format)
 * - work_hours_per_day: Calculated work hours per day
 *
 * ADHD Benefits:
 * - Realistic time estimation (combat time blindness)
 * - Prevents over-commitment
 * - Better capacity visualization
 * - Reduces stress from unrealistic plans
 * - Accounts for actual available working time
 */

async function up(queryInterface, Sequelize) {
    console.log('Running migration 014: Add work schedule configuration');

    // Add work_days (JSON array of weekday numbers: 0=Sunday, 1=Monday, etc.)
    await addColumnIfNotExists(queryInterface, 'users', 'work_days', {
        type: Sequelize.TEXT, // SQLite stores JSON as TEXT
        allowNull: false,
        defaultValue: JSON.stringify([1, 2, 3, 4, 5]), // Mon-Fri default
        comment: 'Days of week user works (JSON array, 0=Sun, 1=Mon, etc.)',
    });
    console.log('✓ Added work_days column to users table');

    // Add work_hours_start (HH:MM format)
    await addColumnIfNotExists(queryInterface, 'users', 'work_hours_start', {
        type: Sequelize.STRING(5),
        allowNull: false,
        defaultValue: '09:00',
        comment: 'Start of work day (HH:MM format)',
    });
    console.log('✓ Added work_hours_start column to users table');

    // Add work_hours_end (HH:MM format)
    await addColumnIfNotExists(queryInterface, 'users', 'work_hours_end', {
        type: Sequelize.STRING(5),
        allowNull: false,
        defaultValue: '17:00',
        comment: 'End of work day (HH:MM format)',
    });
    console.log('✓ Added work_hours_end column to users table');

    // Add work_hours_per_day (calculated field, but can be manually adjusted)
    await addColumnIfNotExists(queryInterface, 'users', 'work_hours_per_day', {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
        defaultValue: 8.0,
        comment: 'Available work hours per day',
    });
    console.log('✓ Added work_hours_per_day column to users table');

    console.log('✓ Migration 014 completed successfully');
}

async function down(queryInterface, Sequelize) {
    console.log('Reverting migration 014: Remove work schedule configuration');

    try {
        await queryInterface.removeColumn('users', 'work_hours_per_day');
        console.log('✓ Removed work_hours_per_day column');
    } catch (error) {
        console.log('⚠ Column work_hours_per_day does not exist, skipping');
    }

    try {
        await queryInterface.removeColumn('users', 'work_hours_end');
        console.log('✓ Removed work_hours_end column');
    } catch (error) {
        console.log('⚠ Column work_hours_end does not exist, skipping');
    }

    try {
        await queryInterface.removeColumn('users', 'work_hours_start');
        console.log('✓ Removed work_hours_start column');
    } catch (error) {
        console.log('⚠ Column work_hours_start does not exist, skipping');
    }

    try {
        await queryInterface.removeColumn('users', 'work_days');
        console.log('✓ Removed work_days column');
    } catch (error) {
        console.log('⚠ Column work_days does not exist, skipping');
    }

    console.log('✓ Migration 014 reverted successfully');
}

module.exports = { up, down };
