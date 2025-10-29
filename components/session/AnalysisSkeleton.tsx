
import React from 'react';
import Card from '../ui/Card';

const SkeletonLine: React.FC<{ width?: string }> = ({ width = 'w-full' }) => (
    <div className={`h-4 bg-muted rounded ${width} animate-pulse`}></div>
);

const AnalysisSkeleton: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <Card>
                <div className="space-y-3">
                    <SkeletonLine width="w-1/3" />
                    <SkeletonLine />
                    <SkeletonLine />
                    <SkeletonLine width="w-3/4" />
                </div>
            </Card>
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <div className="space-y-3">
                        <SkeletonLine width="w-1/2" />
                        <SkeletonLine />
                        <SkeletonLine />
                        <SkeletonLine />
                    </div>
                </Card>
                <Card>
                    <div className="space-y-3">
                         <SkeletonLine width="w-1/2" />
                        <SkeletonLine />
                        <SkeletonLine />
                        <SkeletonLine />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AnalysisSkeleton;
