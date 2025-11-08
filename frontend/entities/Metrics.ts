import { Task } from './Task';

export interface WeeklyCompletion {
    date: string;
    count: number;
    dayName: string;
}

export interface ProjectTimeBreakdown {
    project_id: number | null;
    project_name: string;
    project_uid: string | null;
    total_hours: number;
    task_count: number;
}

export interface TimeTracking {
    active_timer_task: Task | null;
    total_hours_today: number;
    project_breakdown: ProjectTimeBreakdown[];
}

export interface Metrics {
    total_open_tasks: number;
    tasks_pending_over_month: number;
    tasks_in_progress_count: number;
    tasks_in_progress: Task[];
    tasks_due_today: Task[];
    today_plan_tasks?: Task[];
    suggested_tasks: Task[];
    tasks_completed_today: Task[];
    weekly_completions: WeeklyCompletion[];
    time_tracking?: TimeTracking;
}
