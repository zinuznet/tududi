const express = require('express');
const {
    SubtaskTemplate,
    SubtaskTemplateItem,
    Task,
    sequelize,
} = require('../models');
const { getAuthenticatedUserId } = require('../utils/request-utils');
const { Op } = require('sequelize');
const router = express.Router();

// Authentication middleware
router.use((req, res, next) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    req.authUserId = userId;
    next();
});

/**
 * GET /api/subtask-templates
 * Get all templates for the authenticated user
 */
router.get('/', async (req, res) => {
    const userId = req.authUserId;

    try {
        const templates = await SubtaskTemplate.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: SubtaskTemplateItem,
                    as: 'Items',
                    attributes: ['id', 'name', 'sort_order'],
                },
            ],
            order: [
                ['name', 'ASC'],
                [{ model: SubtaskTemplateItem, as: 'Items' }, 'sort_order', 'ASC'],
            ],
        });

        res.json({ templates });
    } catch (error) {
        console.error('Error fetching subtask templates:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

/**
 * GET /api/subtask-templates/:id
 * Get a single template with all items
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.authUserId;

    try {
        const template = await SubtaskTemplate.findOne({
            where: { id, user_id: userId },
            include: [
                {
                    model: SubtaskTemplateItem,
                    as: 'Items',
                    attributes: ['id', 'name', 'sort_order'],
                },
            ],
            order: [[{ model: SubtaskTemplateItem, as: 'Items' }, 'sort_order', 'ASC']],
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        res.json({ template });
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({ error: 'Failed to fetch template' });
    }
});

/**
 * POST /api/subtask-templates
 * Create a new template with items
 * Body: { name, description?, items: [{ name, sort_order }] }
 */
router.post('/', async (req, res) => {
    const { name, description, items } = req.body;
    const userId = req.authUserId;

    if (!name || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            error: 'Template name and at least one item are required',
        });
    }

    const transaction = await sequelize.transaction();

    try {
        // Create template
        const template = await SubtaskTemplate.create(
            {
                user_id: userId,
                name,
                description: description || null,
            },
            { transaction }
        );

        // Create template items
        const templateItems = items.map((item, index) => ({
            template_id: template.id,
            name: item.name,
            sort_order: item.sort_order !== undefined ? item.sort_order : index,
        }));

        await SubtaskTemplateItem.bulkCreate(templateItems, { transaction });

        await transaction.commit();

        // Fetch the complete template with items
        const createdTemplate = await SubtaskTemplate.findOne({
            where: { id: template.id },
            include: [
                {
                    model: SubtaskTemplateItem,
                    as: 'Items',
                    attributes: ['id', 'name', 'sort_order'],
                },
            ],
            order: [[{ model: SubtaskTemplateItem, as: 'Items' }, 'sort_order', 'ASC']],
        });

        res.json({ template: createdTemplate });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating template:', error);
        res.status(500).json({ error: 'Failed to create template' });
    }
});

/**
 * PUT /api/subtask-templates/:id
 * Update a template and its items
 * Body: { name?, description?, items?: [{ id?, name, sort_order }] }
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, items } = req.body;
    const userId = req.authUserId;

    const transaction = await sequelize.transaction();

    try {
        // Find and verify ownership
        const template = await SubtaskTemplate.findOne({
            where: { id, user_id: userId },
        });

        if (!template) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Template not found' });
        }

        // Update template fields
        if (name !== undefined) template.name = name;
        if (description !== undefined) template.description = description;
        await template.save({ transaction });

        // Update items if provided
        if (items && Array.isArray(items)) {
            // Get existing items
            const existingItems = await SubtaskTemplateItem.findAll({
                where: { template_id: id },
            });

            const existingItemIds = existingItems.map((item) => item.id);
            const updatedItemIds = items.filter((item) => item.id).map((item) => item.id);

            // Delete items not in the updated list
            const itemsToDelete = existingItemIds.filter(
                (itemId) => !updatedItemIds.includes(itemId)
            );
            if (itemsToDelete.length > 0) {
                await SubtaskTemplateItem.destroy({
                    where: { id: itemsToDelete },
                    transaction,
                });
            }

            // Update or create items
            for (const item of items) {
                if (item.id) {
                    // Update existing item
                    await SubtaskTemplateItem.update(
                        {
                            name: item.name,
                            sort_order: item.sort_order,
                        },
                        {
                            where: { id: item.id, template_id: id },
                            transaction,
                        }
                    );
                } else {
                    // Create new item
                    await SubtaskTemplateItem.create(
                        {
                            template_id: id,
                            name: item.name,
                            sort_order: item.sort_order,
                        },
                        { transaction }
                    );
                }
            }
        }

        await transaction.commit();

        // Fetch updated template with items
        const updatedTemplate = await SubtaskTemplate.findOne({
            where: { id },
            include: [
                {
                    model: SubtaskTemplateItem,
                    as: 'Items',
                    attributes: ['id', 'name', 'sort_order'],
                },
            ],
            order: [[{ model: SubtaskTemplateItem, as: 'Items' }, 'sort_order', 'ASC']],
        });

        res.json({ template: updatedTemplate });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating template:', error);
        res.status(500).json({ error: 'Failed to update template' });
    }
});

/**
 * DELETE /api/subtask-templates/:id
 * Delete a template (items are cascade deleted)
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.authUserId;

    try {
        const template = await SubtaskTemplate.findOne({
            where: { id, user_id: userId },
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        await template.destroy();

        res.json({ success: true, message: 'Template deleted successfully' });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

/**
 * POST /api/subtask-templates/:id/apply
 * Apply a template to a task (creates subtasks from template items)
 * Body: { task_id }
 */
router.post('/:id/apply', async (req, res) => {
    const { id } = req.params;
    const { task_id } = req.body;
    const userId = req.authUserId;

    if (!task_id) {
        return res.status(400).json({ error: 'task_id is required' });
    }

    const transaction = await sequelize.transaction();

    try {
        // Verify template ownership
        const template = await SubtaskTemplate.findOne({
            where: { id, user_id: userId },
            include: [
                {
                    model: SubtaskTemplateItem,
                    as: 'Items',
                    attributes: ['name', 'sort_order'],
                },
            ],
            order: [[{ model: SubtaskTemplateItem, as: 'Items' }, 'sort_order', 'ASC']],
        });

        if (!template) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Template not found' });
        }

        // Verify task ownership and that it's not a subtask itself
        const task = await Task.findOne({
            where: { id: task_id, user_id: userId },
        });

        if (!task) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Task not found' });
        }

        if (task.parent_task_id) {
            await transaction.rollback();
            return res.status(400).json({
                error: 'Cannot apply template to a subtask',
            });
        }

        // Get current max sort_order for existing subtasks
        const existingSubtasks = await Task.findAll({
            where: { parent_task_id: task_id },
            attributes: [[sequelize.fn('MAX', sequelize.col('sort_order')), 'maxSort']],
            raw: true,
            transaction,
        });

        let maxSortOrder = 0;
        if (existingSubtasks.length > 0 && existingSubtasks[0].maxSort !== null) {
            maxSortOrder = parseInt(existingSubtasks[0].maxSort, 10);
        }

        // Create subtasks from template items
        const subtasksToCreate = template.Items.map((item, index) => ({
            name: item.name,
            user_id: userId,
            parent_task_id: task_id,
            project_id: task.project_id,
            status: 0, // not_started
            sort_order: maxSortOrder + index + 1,
        }));

        const createdSubtasks = await Task.bulkCreate(subtasksToCreate, {
            transaction,
        });

        await transaction.commit();

        res.json({
            success: true,
            message: `Applied template "${template.name}" to task`,
            subtasks: createdSubtasks,
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error applying template:', error);
        res.status(500).json({ error: 'Failed to apply template' });
    }
});

module.exports = router;
