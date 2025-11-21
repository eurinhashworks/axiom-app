import React from 'react';

interface SkeletonProps {
    variant?: 'text' | 'circular' | 'rectangular' | 'card';
    width?: string;
    height?: string;
    className?: string;
    count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'text',
    width,
    height,
    className = '',
    count = 1
}) => {
    const baseClasses = 'bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer bg-[length:200%_100%]';

    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
        card: 'rounded-xl p-6',
    };

    const skeletonElement = (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{
                width: width || (variant === 'text' ? '100%' : undefined),
                height: height || (variant === 'text' ? '1rem' : undefined)
            }}
        />
    );

    if (count === 1) {
        return skeletonElement;
    }

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="mb-2">
                    {skeletonElement}
                </div>
            ))}
        </>
    );
};

// Card Skeleton for Kanban
export const CardSkeleton: React.FC = () => (
    <div className="p-4 bg-card border border-border rounded-xl shadow-sm space-y-3 animate-fade-in">
        <div className="flex justify-between items-start">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="circular" width="24px" height="24px" />
        </div>
        <Skeleton variant="text" count={3} />
        <div className="flex items-center justify-between pt-2 border-t border-border">
            <Skeleton variant="rectangular" width="60px" height="20px" />
            <Skeleton variant="text" width="80px" height="12px" />
        </div>
    </div>
);

// Table Row Skeleton
export const TableRowSkeleton: React.FC = () => (
    <tr className="border-b border-border animate-fade-in">
        <td className="p-4">
            <Skeleton variant="text" width="80%" />
        </td>
        <td className="p-4">
            <Skeleton variant="rectangular" width="100px" height="24px" />
        </td>
        <td className="p-4">
            <Skeleton variant="rectangular" width="60px" height="20px" />
        </td>
        <td className="p-4">
            <Skeleton variant="text" width="100px" />
        </td>
    </tr>
);

// List Item Skeleton
export const ListItemSkeleton: React.FC = () => (
    <div className="flex items-center space-x-4 p-4 bg-card border border-border rounded-lg animate-fade-in">
        <Skeleton variant="circular" width="48px" height="48px" />
        <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
        </div>
    </div>
);

export default Skeleton;
