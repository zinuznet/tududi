/**
 * Section entity
 * Represents a section within a project for organizing tasks
 */
export interface Section {
    id: number;
    project_id: number;
    name: string;
    sort_order: number;
    collapsed: boolean;
    created_at?: string;
    updated_at?: string;
}
