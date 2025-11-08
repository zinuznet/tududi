import React, { useState } from 'react';
import { Section } from '../../entities/Section';
import {
    ChevronDownIcon,
    ChevronRightIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface SectionHeaderProps {
    section: Section;
    taskCount: number;
    onToggleCollapse: (sectionId: number, collapsed: boolean) => void;
    onRename: (sectionId: number, newName: string) => void;
    onDelete: (sectionId: number) => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    section,
    taskCount,
    onToggleCollapse,
    onRename,
    onDelete,
}) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(section.name);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleStartEdit = () => {
        setEditName(section.name);
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        if (editName.trim() && editName !== section.name) {
            onRename(section.id, editName.trim());
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditName(section.name);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    const handleDelete = () => {
        onDelete(section.id);
        setShowDeleteConfirm(false);
    };

    return (
        <div className="group flex items-center justify-between py-3 px-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
            <div className="flex items-center flex-1 min-w-0">
                {/* Collapse/Expand Button */}
                <button
                    onClick={() => onToggleCollapse(section.id, !section.collapsed)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors mr-2"
                    title={
                        section.collapsed
                            ? t('section.expand', 'Expand section')
                            : t('section.collapse', 'Collapse section')
                    }
                >
                    {section.collapsed ? (
                        <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    )}
                </button>

                {/* Section Name / Edit Input */}
                {isEditing ? (
                    <div className="flex items-center space-x-2 flex-1">
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSaveEdit}
                            autoFocus
                            className="flex-1 px-2 py-1 text-sm font-medium bg-white dark:bg-gray-900 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSaveEdit}
                            className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                            title={t('common.save', 'Save')}
                        >
                            <CheckIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            title={t('common.cancel', 'Cancel')}
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {section.name}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            ({taskCount})
                        </span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {!isEditing && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleStartEdit}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        title={t('section.rename', 'Rename section')}
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>

                    {showDeleteConfirm ? (
                        <div className="flex items-center space-x-1 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                            <span className="text-xs text-red-600 dark:text-red-400">
                                {t('section.deleteConfirm', 'Delete?')}
                            </span>
                            <button
                                onClick={handleDelete}
                                className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                                title={t('common.confirm', 'Confirm')}
                            >
                                <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="p-1 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                title={t('common.cancel', 'Cancel')}
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                            title={t('section.delete', 'Delete section')}
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SectionHeader;
