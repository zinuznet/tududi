const { addColumnIfNotExists } = require('../utils/migration-utils');

/**
 * Migration 016: Add Color to Tags
 *
 * Adds color field to tags for visual categorization
 *
 * ADHD Benefits:
 * - Instant visual categorization (no reading required)
 * - Faster task scanning
 * - Color-coding reduces cognitive load
 * - Emotional/contextual associations with colors
 * - Pattern recognition over text processing
 */

async function up(queryInterface, Sequelize) {
    console.log('Running migration 016: Add color to tags');

    // Add color field (hex color code)
    await addColumnIfNotExists(queryInterface, 'tags', 'color', {
        type: Sequelize.STRING(7), // #RRGGBB format
        allowNull: true,
        defaultValue: null,
        comment: 'Hex color code for tag (e.g., #FF5733)',
    });
    console.log('✓ Added color column to tags table');

    console.log('✓ Migration 016 completed successfully');
}

async function down(queryInterface, Sequelize) {
    console.log('Reverting migration 016: Remove color from tags');

    try {
        await queryInterface.removeColumn('tags', 'color');
        console.log('✓ Removed color column');
    } catch (error) {
        console.log('⚠ Column color does not exist, skipping');
    }

    console.log('✓ Migration 016 reverted successfully');
}

module.exports = { up, down };
