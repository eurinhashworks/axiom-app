// Fix: Implement AnalysisComplete component to resolve module not found and related errors.
import React from 'react';
import { Idea } from '../../types';
import AnalysisView from './AnalysisView';
import EvaluationView from './EvaluationView';
import RoadmapView from './RoadmapView';

interface AnalysisCompleteProps {
    idea: Idea;
}

const AnalysisComplete: React.FC<AnalysisCompleteProps> = ({ idea }) => {
    return (
        <div className="space-y-8">
            <AnalysisView idea={idea} />
            
            { (idea.status === 'EVALUATED' || idea.status === 'ROADMAP_GENERATED') && 
                <EvaluationView idea={idea} /> 
            }

            { idea.status === 'ROADMAP_GENERATED' && 
                <RoadmapView idea={idea} />
            }
        </div>
    );
};

export default AnalysisComplete;
