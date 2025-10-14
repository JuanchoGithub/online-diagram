import React, { useMemo } from 'react';
import { syntaxService } from '../../services/syntaxService';
import type { ThemeName } from '../../types';
import { FlowchartBuilder } from './flowchart/FlowchartBuilder';
import { SequenceBuilder } from './sequence/SequenceBuilder';
import { ErBuilder } from './er/ErBuilder';
import { UnsupportedBuilder } from './UnsupportedBuilder';

interface VisualBuilderViewProps {
    code: string;
    onCodeChange: (newCode: string) => void;
    theme: ThemeName;
    showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const VisualBuilderView: React.FC<VisualBuilderViewProps> = (props) => {
    const diagramInfo = useMemo(() => syntaxService.getDiagramType(props.code), [props.code]);

    const renderBuilder = () => {
        // Default to flowchart builder if no type can be determined (e.g., empty code)
        if (!diagramInfo) {
            return <FlowchartBuilder {...props} />;
        }
        
        switch (diagramInfo.keyword) {
            case 'graph':
            case 'flowchart':
                return <FlowchartBuilder {...props} />;
            case 'sequenceDiagram':
                return <SequenceBuilder {...props} />;
            case 'erDiagram':
                return <ErBuilder {...props} />;
            default:
                return <UnsupportedBuilder diagramType={diagramInfo.type} />;
        }
    };

    return <div className="h-[calc(100vh-6.5rem)]">{renderBuilder()}</div>;
};
