import React, { useState } from 'react';
import { Task } from '../../entities/Task';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { reorderTasks } from '../../utils/tasksService';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface DraggableTaskListProps {
    tasks: Task[];
    projectId?: number;
    onTasksReordered: (reorderedTasks: Task[]) => void;
    renderTask: (task: Task, isDragging: boolean) => React.ReactNode;
}

interface SortableTaskProps {
    task: Task;
    renderTask: (task: Task, isDragging: boolean) => React.ReactNode;
}

const SortableTask: React.FC<SortableTaskProps> = ({ task, renderTask }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id!.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute left-0 top-0 bottom-0 flex items-center px-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
            >
                <Bars3Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>

            {/* Task Content */}
            <div className="pl-8">{renderTask(task, isDragging)}</div>
        </div>
    );
};

const DraggableTaskList: React.FC<DraggableTaskListProps> = ({
    tasks,
    projectId,
    onTasksReordered,
    renderTask,
}) => {
    const [items, setItems] = useState(tasks);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement required to start drag
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex(
                (item) => item.id!.toString() === active.id
            );
            const newIndex = items.findIndex(
                (item) => item.id!.toString() === over.id
            );

            const reordered = arrayMove(items, oldIndex, newIndex);

            // Optimistic update
            setItems(reordered);

            // Update sort_order based on new positions
            const taskOrders = reordered.map((task, index) => ({
                id: task.id!,
                sort_order: index,
            }));

            try {
                await reorderTasks(taskOrders, projectId);
                // Notify parent component of the reordering
                onTasksReordered(reordered);
            } catch (error) {
                console.error('Error reordering tasks:', error);
                // Revert on error
                setItems(items);
            }
        }
    };

    // Update items when tasks prop changes
    React.useEffect(() => {
        setItems(tasks);
    }, [tasks]);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={items.map((t) => t.id!.toString())}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-1">
                    {items.map((task) => (
                        <SortableTask
                            key={task.id}
                            task={task}
                            renderTask={renderTask}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default DraggableTaskList;
