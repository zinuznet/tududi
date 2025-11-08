const { tableExists, addColumnIfNotExists } = require('../utils/migration-helpers');

/**
 * Migration 013: Add Subtask Templates for Reusable Workflows
 *
 * Creates two tables:
 * - subtask_templates: Template definitions (e.g., "Deploy to Production")
 * - subtask_template_items: Individual subtask items within a template
 *
 * Features:
 * - Create reusable subtask templates
 * - Apply templates to any task
 * - Edit and manage templates
 * - Sort order for template items
 *
 * ADHD Benefits:
 * - Eliminates decision fatigue (ready-made checklists)
 * - Process standardization (fewer errors)
 * - Quick task initiation (no planning from scratch)
 * - Reduces anxiety about complex tasks
 */

async function up(queryInterface, Sequelize) {
    console.log('Running migration 013: Add subtask templates');

    // 1. Create subtask_templates table
    const templatesTableName = 'subtask_templates';
    const templatesExists = await tableExists(queryInterface, templatesTableName);

    if (!templatesExists) {
        await queryInterface.createTable(templatesTableName, {
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
                comment: 'User who created this template',
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false,
                comment: 'Template name (e.g., "Deploy to Production")',
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Optional description of the template',
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

        // Add indexes for templates
        await queryInterface.addIndex(templatesTableName, ['user_id'], {
            name: 'idx_subtask_templates_user_id',
        });

        console.log('✓ Created subtask_templates table with indexes');
    } else {
        console.log('⚠ Table subtask_templates already exists, skipping creation');
    }

    // 2. Create subtask_template_items table
    const itemsTableName = 'subtask_template_items';
    const itemsExists = await tableExists(queryInterface, itemsTableName);

    if (!itemsExists) {
        await queryInterface.createTable(itemsTableName, {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            template_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'subtask_templates',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                comment: 'Template this item belongs to',
            },
            name: {
                type: Sequelize.STRING(500),
                allowNull: false,
                comment: 'Subtask name/description',
            },
            sort_order: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: 'Order position within template',
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

        // Add indexes for template items
        await queryInterface.addIndex(itemsTableName, ['template_id'], {
            name: 'idx_subtask_template_items_template_id',
        });

        await queryInterface.addIndex(itemsTableName, ['template_id', 'sort_order'], {
            name: 'idx_subtask_template_items_template_sort',
        });

        console.log('✓ Created subtask_template_items table with indexes');
    } else {
        console.log('⚠ Table subtask_template_items already exists, skipping creation');
    }

    console.log('✓ Migration 013 completed successfully');
}

async function down(queryInterface, Sequelize) {
    console.log('Reverting migration 013: Remove subtask templates');

    // Drop template items table first (foreign key dependency)
    const itemsExists = await tableExists(queryInterface, 'subtask_template_items');
    if (itemsExists) {
        await queryInterface.dropTable('subtask_template_items');
        console.log('✓ Dropped subtask_template_items table');
    } else {
        console.log('⚠ Table subtask_template_items does not exist, skipping drop');
    }

    // Drop templates table
    const templatesExists = await tableExists(queryInterface, 'subtask_templates');
    if (templatesExists) {
        await queryInterface.dropTable('subtask_templates');
        console.log('✓ Dropped subtask_templates table');
    } else {
        console.log('⚠ Table subtask_templates does not exist, skipping drop');
    }

    console.log('✓ Migration 013 reverted successfully');
}

module.exports = { up, down };
