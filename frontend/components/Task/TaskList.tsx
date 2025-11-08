import React from 'react';
import TaskItem from './TaskItem';
import DraggableTaskList from './DraggableTaskList';
import { Project } from '../../entities/Project';
import { Task } from '../../entities/Task';

interface TaskListProps {
    tasks: Task[];
    onTaskUpdate: (task: Task) => Promise<void>;
    onTaskCompletionToggle?: (task: Task) => void;
    onTaskCreate?: (task: Task) => void;
    onTaskDelete: (taskId: number) => void;
    projects: Project[];
    hideProjectName?: boolean;
    onToggleToday?: (taskId: number) => Promise<void>;
    showCompletedTasks?: boolean;
    enableDragAndDrop?: boolean; // Enable drag & drop reordering
    projectId?: number; // Project ID for scoped reordering
    onTasksReordered?: (reorderedTasks: Task[]) => void; // Callback after reordering
}

const TaskList: React.FC<TaskListProps> = ({
    tasks,
    onTaskUpdate,
    onTaskCompletionToggle,
    onTaskDelete,
    projects,
    hideProjectName = false,
    onToggleToday,
    showCompletedTasks = false,
    enableDragAndDrop = false,
    projectId,
    onTasksReordered,
}) => {
    // Conditionally filter tasks based on showCompletedTasks prop
    const filteredTasks = showCompletedTasks
        ? tasks
        : tasks.filter((task) => {
              const isCompleted =
                  task.status === 'done' ||
                  task.status === 'archived' ||
                  task.status === 2 ||
                  task.status === 3;
              return !isCompleted;
          });

    // Render function for task items
    const renderTask = (task: Task, isDragging: boolean) => (
        <div
            className={`task-item-wrapper transition-all duration-200 ease-in-out overflow-visible ${
                isDragging ? 'opacity-50' : ''
            }`}
            data-testid={`task-item-${task.id}`}
        >
            <TaskItem
                task={task}
                onTaskUpdate={onTaskUpdate}
                onTaskCompletionToggle={onTaskCompletionToggle}
                onTaskDelete={onTaskDelete}
                projects={projects}
                hideProjectName={hideProjectName}
                onToggleToday={onToggleToday}
            />
        </div>
    );

    return (
        <div className="task-list-container space-y-1.5 overflow-visible">
            {filteredTasks.length > 0 ? (
                enableDragAndDrop ? (
                    <DraggableTaskList
                        tasks={filteredTasks}
                        projectId={projectId}
                        onTasksReordered={onTasksReordered || (() => {})}
                        renderTask={renderTask}
                    />
                ) : (
                    filteredTasks.map((task) => (
                        <React.Fragment key={task.id}>
                            {renderTask(task, false)}
                        </React.Fragment>
                    ))
                )
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center mt-4">
                    No tasks available.
                </p>
            )}
        </div>
    );
};

export default TaskList;
