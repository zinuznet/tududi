import { SubtaskTemplate, SubtaskTemplateItem } from '../entities/SubtaskTemplate';
import { Task } from '../entities/Task';
import { handleAuthResponse } from './authUtils';

/**
 * Fetch all subtask templates for the authenticated user
 */
export const fetchSubtaskTemplates = async (): Promise<SubtaskTemplate[]> => {
    const response = await fetch('/api/subtask-templates', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
    });

    await handleAuthResponse(response, 'Failed to fetch subtask templates.');

    const data = await response.json();
    return data.templates || [];
};

/**
 * Fetch a single subtask template by ID
 */
export const fetchSubtaskTemplate = async (templateId: number): Promise<SubtaskTemplate> => {
    const response = await fetch(`/api/subtask-templates/${templateId}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
    });

    await handleAuthResponse(response, 'Failed to fetch subtask template.');

    const data = await response.json();
    return data.template;
};

/**
 * Create a new subtask template
 */
export const createSubtaskTemplate = async (
    name: string,
    items: SubtaskTemplateItem[],
    description?: string
): Promise<SubtaskTemplate> => {
    const response = await fetch('/api/subtask-templates', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({ name, description, items }),
    });

    await handleAuthResponse(response, 'Failed to create subtask template.');

    const data = await response.json();
    return data.template;
};

/**
 * Update an existing subtask template
 */
export const updateSubtaskTemplate = async (
    templateId: number,
    updates: {
        name?: string;
        description?: string;
        items?: SubtaskTemplateItem[];
    }
): Promise<SubtaskTemplate> => {
    const response = await fetch(`/api/subtask-templates/${templateId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(updates),
    });

    await handleAuthResponse(response, 'Failed to update subtask template.');

    const data = await response.json();
    return data.template;
};

/**
 * Delete a subtask template
 */
export const deleteSubtaskTemplate = async (
    templateId: number
): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`/api/subtask-templates/${templateId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { Accept: 'application/json' },
    });

    await handleAuthResponse(response, 'Failed to delete subtask template.');

    return await response.json();
};

/**
 * Apply a template to a task (creates subtasks from template items)
 */
export const applyTemplateToTask = async (
    templateId: number,
    taskId: number
): Promise<{ success: boolean; message: string; subtasks: Task[] }> => {
    const response = await fetch(`/api/subtask-templates/${templateId}/apply`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({ task_id: taskId }),
    });

    await handleAuthResponse(response, 'Failed to apply template to task.');

    return await response.json();
};
