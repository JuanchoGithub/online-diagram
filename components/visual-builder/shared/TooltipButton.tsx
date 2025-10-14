import React from 'react';
import { Button } from '../../Button';
import { Icon } from '../../Icon';

export const TooltipButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
    iconName: string;
    tooltipText: string;
}> = ({ iconName, tooltipText, className, ...props }) => (
    <div className="relative group">
        <Button {...props} className={`!p-2 ${className || ''}`}>
            <Icon name={iconName} className="w-5 h-5" />
        </Button>
        <div
            className="absolute top-full mt-2 w-max bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-75 pointer-events-none z-10"
            style={{ transitionDelay: '100ms', left: '50%', transform: 'translateX(-50%)' }}
            role="tooltip"
        >
            {tooltipText}
        </div>
    </div>
);
