import React from 'react';
import Card from '../ui/Card';

const AnalysisCompleteMessage: React.FC = () => {
    return (
        <Card className="bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-center p-4 mb-8">
            <h3 className="font-semibold text-green-800 dark:text-green-200">Analyse Terminée !</h3>
            <p className="text-sm text-green-700 dark:text-green-300">
                L'analyse initiale de votre idée est terminée. Faites défiler vers le bas pour voir les résultats et les prochaines étapes.
            </p>
        </Card>
    );
};

export default AnalysisCompleteMessage;
