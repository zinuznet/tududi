const { addColumnIfNotExists } = require('../utils/migration-utils');

/**
 * Migration 015: Add When Time and Energy Level to Tasks
 *
 * Adds fields to Task model for energy-aware scheduling:
 * - when_time: Preferred time of day to do task (morning/afternoon/evening/anytime)
 * - energy_level: Required energy level (low/medium/high)
 *
 * ADHD Benefits:
 * - Match tasks to natural energy rhythms
 * - Schedule demanding tasks during peak hours
 * - Save easy tasks for low-energy times
 * - Reduce frustration from wrong task at wrong time
 * - Conscious energy management
 * - Combat executive dysfunction by matching task difficulty to current state
 */

async function up(queryInterface, Sequelize) {
    console.log('Running migration 015: Add when_time and energy_level to tasks');

    // Add when_time (preferred time of day)
    await addColumnIfNotExists(queryInterface, 'tasks', 'when_time', {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: null,
        comment: 'Preferred time of day: morning, afternoon, evening, anytime',
    });
    console.log('✓ Added when_time column to tasks table');

    // Add energy_level (required energy)
    await addColumnIfNotExists(queryInterface, 'tasks', 'energy_level', {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: null,
        comment: 'Required energy level: low, medium, high',
    });
    console.log('✓ Added energy_level column to tasks table');

    console.log('✓ Migration 015 completed successfully');
}

async function down(queryInterface, Sequelize) {
    console.log('Reverting migration 015: Remove when_time and energy_level');

    try {
        await queryInterface.removeColumn('tasks', 'energy_level');
        console.log('✓ Removed energy_level column');
    } catch (error) {
        console.log('⚠ Column energy_level does not exist, skipping');
    }

    try {
        await queryInterface.removeColumn('tasks', 'when_time');
        console.log('✓ Removed when_time column');
    } catch (error) {
        console.log('⚠ Column when_time does not exist, skipping');
    }

    console.log('✓ Migration 015 reverted successfully');
}

module.exports = { up, down };
