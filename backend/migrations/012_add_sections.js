const { tableExists, addColumnIfNotExists } = require('../utils/migration-utils');

/**
 * Migration 012: Add Project Sections for Task Organization
 *
 * Creates sections table and adds section_id to tasks for grouping.
 * Adds sort_order to tasks and sections for manual ordering.
 *
 * Features:
 * - Create/edit/delete sections within projects
 * - Organize tasks into sections
 * - Manual ordering of tasks within sections
 * - Manual ordering of sections within projects
 * - Collapse/expand sections
 * - "No section" group for unorganized tasks
 *
 * ADHD Benefits:
 * - Reduces cognitive load by chunking long task lists
 * - Visual organization matches mental models
 * - Flexibility to arrange tasks by current context
 * - Focus mode through collapsing irrelevant sections
 */

async function up(queryInterface, Sequelize) {
    console.log('Running migration 012: Add sections for project organization');

    // 1. Create sections table
    const sectionsTableName = 'sections';
    const sectionsExists = await tableExists(queryInterface, sectionsTableName);

    if (!sectionsExists) {
        await queryInterface.createTable(sectionsTableName, {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            project_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'projects',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                comment: 'Project this section belongs to',
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false,
                comment: 'Section name (e.g., "Frontend", "Backend", "Design")',
            },
            sort_order: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: 'Manual ordering position within project',
            },
            collapsed: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: 'Whether section is collapsed in UI',
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

        // Add indexes for sections
        await queryInterface.addIndex(sectionsTableName, ['project_id'], {
            name: 'idx_sections_project_id',
        });

        await queryInterface.addIndex(sectionsTableName, ['project_id', 'sort_order'], {
            name: 'idx_sections_project_sort',
        });

        console.log('✓ Created sections table with indexes');
    } else {
        console.log('⚠ Table sections already exists, skipping creation');
    }

    // 2. Add section_id to tasks table
    await addColumnIfNotExists(queryInterface, 'tasks', 'section_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'sections',
            key: 'id',
        },
        onDelete: 'SET NULL',
        comment: 'Section this task belongs to (null = no section)',
    });
    console.log('✓ Added section_id column to tasks table');

    // 3. Add sort_order to tasks table for manual ordering
    await addColumnIfNotExists(queryInterface, 'tasks', 'sort_order', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Manual ordering position within section or project',
    });
    console.log('✓ Added sort_order column to tasks table');

    // 4. Add index for tasks ordering
    try {
        await queryInterface.addIndex('tasks', ['project_id', 'section_id', 'sort_order'], {
            name: 'idx_tasks_project_section_sort',
        });
        console.log('✓ Added index for tasks ordering');
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('⚠ Index idx_tasks_project_section_sort already exists, skipping');
        } else {
            throw error;
        }
    }

    console.log('✓ Migration 012 completed successfully');
}

async function down(queryInterface, Sequelize) {
    console.log('Reverting migration 012: Remove sections');

    // Remove index
    try {
        await queryInterface.removeIndex('tasks', 'idx_tasks_project_section_sort');
        console.log('✓ Removed tasks ordering index');
    } catch (error) {
        console.log('⚠ Index idx_tasks_project_section_sort does not exist, skipping');
    }

    // Remove columns from tasks
    try {
        await queryInterface.removeColumn('tasks', 'sort_order');
        console.log('✓ Removed sort_order column from tasks');
    } catch (error) {
        console.log('⚠ Column sort_order does not exist, skipping');
    }

    try {
        await queryInterface.removeColumn('tasks', 'section_id');
        console.log('✓ Removed section_id column from tasks');
    } catch (error) {
        console.log('⚠ Column section_id does not exist, skipping');
    }

    // Drop sections table
    const sectionsExists = await tableExists(queryInterface, 'sections');
    if (sectionsExists) {
        await queryInterface.dropTable('sections');
        console.log('✓ Dropped sections table');
    } else {
        console.log('⚠ Table sections does not exist, skipping drop');
    }

    console.log('✓ Migration 012 reverted successfully');
}

module.exports = { up, down };
