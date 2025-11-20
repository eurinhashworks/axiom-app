// Fix: Implement AnalysisComplete component to resolve module not found and related errors.
import React from 'react';
import { Idea } from '../../types';
import AnalysisView from './AnalysisView';
import EvaluationView from './EvaluationView';
import RoadmapView from './RoadmapView';
import GoNoGoDecisionView from '../dashboard/GoNoGoDecisionView';
import SWOTAnalysisView from '../dashboard/SWOTAnalysisView';
import CompetitiveComparisonView from '../dashboard/CompetitiveComparisonView';
import WebResearchResultsView from '../dashboard/WebResearchResultsView';

interface AnalysisCompleteProps {
    idea: Idea;
}

const AnalysisComplete: React.FC<AnalysisCompleteProps> = ({ idea }) => {
    return (
        <div className="space-y-8">
            <AnalysisView idea={idea} />
            
            {/* Sprint 1: Analyses enrichies */}
            {idea.goNoGo && (
                <GoNoGoDecisionView goNoGo={idea.goNoGo} />
            )}

            {idea.swotAnalysis && (
                <SWOTAnalysisView swotAnalysis={idea.swotAnalysis} />
            )}

            {idea.competitiveAnalysis && (
                <CompetitiveComparisonView competitiveAnalysis={idea.competitiveAnalysis} />
            )}

            {idea.webResearch && (
                <WebResearchResultsView webResearch={idea.webResearch} />
            )}

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
