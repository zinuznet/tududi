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
import { reorderSubtasks } from '../../utils/tasksService';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface DraggableSubtasksListProps {
    subtasks: Task[];
    onSubtasksReordered: (reorderedSubtasks: Task[]) => void;
    renderSubtask: (subtask: Task, isDragging: boolean) => React.ReactNode;
}

interface SortableSubtaskProps {
    subtask: Task;
    renderSubtask: (subtask: Task, isDragging: boolean) => React.ReactNode;
}

const SortableSubtask: React.FC<SortableSubtaskProps> = ({
    subtask,
    renderSubtask,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: subtask.id!.toString() });

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
                <Bars3Icon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>

            {/* Subtask Content */}
            <div className="pl-8">{renderSubtask(subtask, isDragging)}</div>
        </div>
    );
};

const DraggableSubtasksList: React.FC<DraggableSubtasksListProps> = ({
    subtasks,
    onSubtasksReordered,
    renderSubtask,
}) => {
    const [items, setItems] = useState(subtasks);

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
            const subtaskOrders = reordered.map((subtask, index) => ({
                id: subtask.id!,
                sort_order: index,
            }));

            try {
                // Get parent task ID from first subtask
                const parentTaskId = reordered[0].parent_task_id;
                if (parentTaskId) {
                    await reorderSubtasks(parentTaskId, subtaskOrders);
                    // Notify parent component of the reordering
                    onSubtasksReordered(reordered);
                }
            } catch (error) {
                console.error('Error reordering subtasks:', error);
                // Revert on error
                setItems(items);
            }
        }
    };

    // Update items when subtasks prop changes
    React.useEffect(() => {
        setItems(subtasks);
    }, [subtasks]);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={items.map((s) => s.id!.toString())}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-1">
                    {items.map((subtask) => (
                        <SortableSubtask
                            key={subtask.id}
                            subtask={subtask}
                            renderSubtask={renderSubtask}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default DraggableSubtasksList;
