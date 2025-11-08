import { Section } from '../entities/Section';
import { Task } from '../entities/Task';
import { handleAuthResponse } from './authUtils';

/**
 * Create a new section in a project
 */
export const createSection = async (
    projectId: number,
    name: string
): Promise<{ section: Section }> => {
    const response = await fetch('/api/sections', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({ project_id: projectId, name }),
    });

    await handleAuthResponse(response, 'Failed to create section.');
    return await response.json();
};

/**
 * Update a section (name or collapsed state)
 */
export const updateSection = async (
    sectionId: number,
    updates: { name?: string; collapsed?: boolean }
): Promise<{ section: Section }> => {
    const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(updates),
    });

    await handleAuthResponse(response, 'Failed to update section.');
    return await response.json();
};

/**
 * Delete a section (tasks will be moved to "No Section")
 */
export const deleteSection = async (
    sectionId: number
): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { Accept: 'application/json' },
    });

    await handleAuthResponse(response, 'Failed to delete section.');
    return await response.json();
};

/**
 * Reorder sections within a project
 */
export const reorderSections = async (
    projectId: number,
    sectionOrders: Array<{ id: number; sort_order: number }>
): Promise<{ sections: Section[] }> => {
    const response = await fetch('/api/sections/reorder', {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({ project_id: projectId, section_orders: sectionOrders }),
    });

    await handleAuthResponse(response, 'Failed to reorder sections.');
    return await response.json();
};

/**
 * Move a task to a section and/or update its sort order
 */
export const moveTask = async (
    taskId: number,
    sectionId: number | null,
    sortOrder?: number
): Promise<{ task: Task }> => {
    const response = await fetch('/api/sections/move-task', {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            task_id: taskId,
            section_id: sectionId,
            sort_order: sortOrder,
        }),
    });

    await handleAuthResponse(response, 'Failed to move task.');
    return await response.json();
};
