const express = require('express');
const { Section, Project, Task, sequelize } = require('../models');
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
 * POST /api/sections
 * Create a new section in a project
 */
router.post('/', async (req, res) => {
    const { project_id, name } = req.body;
    const userId = req.authUserId;

    if (!project_id || !name) {
        return res
            .status(400)
            .json({ error: 'project_id and name are required' });
    }

    try {
        // Verify user owns the project
        const project = await Project.findOne({
            where: { id: project_id, user_id: userId },
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Get the max sort_order for this project's sections
        const maxSortOrder = await Section.max('sort_order', {
            where: { project_id },
        });

        const section = await Section.create({
            project_id,
            name,
            sort_order: (maxSortOrder || 0) + 1,
            collapsed: false,
        });

        res.json({ section });
    } catch (error) {
        console.error('Error creating section:', error);
        res.status(500).json({ error: 'Failed to create section' });
    }
});

/**
 * PUT /api/sections/:id
 * Update a section (name, collapsed state)
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, collapsed } = req.body;
    const userId = req.authUserId;

    try {
        // Find section and verify ownership through project
        const section = await Section.findOne({
            where: { id },
            include: [
                {
                    model: Project,
                    as: 'Project',
                    where: { user_id: userId },
                    required: true,
                },
            ],
        });

        if (!section) {
            return res.status(404).json({ error: 'Section not found' });
        }

        // Update fields
        if (name !== undefined) section.name = name;
        if (collapsed !== undefined) section.collapsed = collapsed;

        await section.save();

        res.json({ section });
    } catch (error) {
        console.error('Error updating section:', error);
        res.status(500).json({ error: 'Failed to update section' });
    }
});

/**
 * DELETE /api/sections/:id
 * Delete a section (tasks in section will have section_id set to null)
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.authUserId;

    try {
        // Find section and verify ownership
        const section = await Section.findOne({
            where: { id },
            include: [
                {
                    model: Project,
                    as: 'Project',
                    where: { user_id: userId },
                    required: true,
                },
            ],
        });

        if (!section) {
            return res.status(404).json({ error: 'Section not found' });
        }

        const projectId = section.project_id;

        // Set section_id to null for all tasks in this section
        await Task.update(
            { section_id: null },
            { where: { section_id: id } }
        );

        // Delete the section
        await section.destroy();

        // Reorder remaining sections
        const remainingSections = await Section.findAll({
            where: { project_id: projectId },
            order: [['sort_order', 'ASC']],
        });

        for (let i = 0; i < remainingSections.length; i++) {
            remainingSections[i].sort_order = i + 1;
            await remainingSections[i].save();
        }

        res.json({ success: true, message: 'Section deleted' });
    } catch (error) {
        console.error('Error deleting section:', error);
        res.status(500).json({ error: 'Failed to delete section' });
    }
});

/**
 * PUT /api/sections/reorder
 * Reorder sections within a project
 * Body: { project_id, section_orders: [{ id, sort_order }, ...] }
 */
router.put('/reorder', async (req, res) => {
    const { project_id, section_orders } = req.body;
    const userId = req.authUserId;

    if (!project_id || !Array.isArray(section_orders)) {
        return res.status(400).json({
            error: 'project_id and section_orders array are required',
        });
    }

    const transaction = await sequelize.transaction();

    try {
        // Verify user owns the project
        const project = await Project.findOne({
            where: { id: project_id, user_id: userId },
        });

        if (!project) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Project not found' });
        }

        // Update each section's sort_order
        for (const { id, sort_order } of section_orders) {
            await Section.update(
                { sort_order },
                {
                    where: {
                        id,
                        project_id, // Ensure section belongs to this project
                    },
                    transaction,
                }
            );
        }

        await transaction.commit();

        // Fetch updated sections
        const sections = await Section.findAll({
            where: { project_id },
            order: [['sort_order', 'ASC']],
        });

        res.json({ sections });
    } catch (error) {
        await transaction.rollback();
        console.error('Error reordering sections:', error);
        res.status(500).json({ error: 'Failed to reorder sections' });
    }
});

/**
 * PUT /api/sections/move-task
 * Move a task to a section and/or reorder within section
 * Body: { task_id, section_id, sort_order }
 */
router.put('/move-task', async (req, res) => {
    const { task_id, section_id, sort_order } = req.body;
    const userId = req.authUserId;

    if (!task_id) {
        return res.status(400).json({ error: 'task_id is required' });
    }

    try {
        // Find task and verify ownership
        const task = await Task.findOne({
            where: { id: task_id, user_id: userId },
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // If section_id is provided, verify it belongs to the same project
        if (section_id !== null && section_id !== undefined) {
            const section = await Section.findOne({
                where: { id: section_id },
            });

            if (!section) {
                return res.status(404).json({ error: 'Section not found' });
            }

            if (section.project_id !== task.project_id) {
                return res.status(400).json({
                    error: 'Section does not belong to the same project as task',
                });
            }
        }

        // Update task
        if (section_id !== undefined) task.section_id = section_id;
        if (sort_order !== undefined) task.sort_order = sort_order;

        await task.save();

        res.json({ task });
    } catch (error) {
        console.error('Error moving task:', error);
        res.status(500).json({ error: 'Failed to move task' });
    }
});

module.exports = router;
