import React from 'react';
import { ClockIcon } from '@heroicons/react/24/solid';

interface ActiveTimerIndicatorProps {
    isActive: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const ActiveTimerIndicator: React.FC<ActiveTimerIndicatorProps> = ({
    isActive,
    size = 'sm',
}) => {
    if (!isActive) return null;

    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    return (
        <div className="relative inline-block">
            {/* Pulsing background circle */}
            <span className="flex relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <ClockIcon
                    className={`relative ${sizeClasses[size]} text-blue-600 dark:text-blue-400`}
                    title="Timer is running"
                />
            </span>
        </div>
    );
};

export default ActiveTimerIndicator;
