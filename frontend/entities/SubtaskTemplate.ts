/**
 * Subtask Template entities
 * For creating reusable subtask workflow patterns
 */

export interface SubtaskTemplateItem {
    id?: number;
    template_id?: number;
    name: string;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

export interface SubtaskTemplate {
    id?: number;
    user_id?: number;
    name: string;
    description?: string | null;
    items?: SubtaskTemplateItem[];
    Items?: SubtaskTemplateItem[]; // Sequelize association naming
    created_at?: string;
    updated_at?: string;
}
