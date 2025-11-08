import { Task } from '../entities/Task';

export interface PlannerContext {
    timeOfDay: 'morning' | 'afternoon' | 'evening';
    typicalEnergy: 'low' | 'medium' | 'high';
    inWorkHours: boolean;
    hour: number;
}

export interface PlannerResponse {
    context: PlannerContext;
    suggestions: Task[];
}

/**
 * Fetch smart task suggestions based on current time and energy context
 */
export const fetchSmartSuggestions = async (): Promise<PlannerResponse> => {
    const response = await fetch('/api/planner/suggest', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch smart suggestions');
    }

    return response.json();
};
