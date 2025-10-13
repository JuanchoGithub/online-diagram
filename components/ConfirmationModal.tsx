import React from 'react';
import { Icon } from './Icon';
import { Button } from './Button';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    confirmButtonClass?: string;
    onSecondaryAction?: () => void;
    secondaryActionText?: string;
    secondaryActionButtonClass?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmButtonClass = '!bg-red-600 hover:!bg-red-700',
    onSecondaryAction,
    secondaryActionText,
    secondaryActionButtonClass,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] transition-opacity duration-300"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex-shrink-0 bg-gray-700 p-4 flex justify-between items-center rounded-t-lg">
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <Icon name="x" className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    <div className="text-sm text-gray-300">{message}</div>
                </div>

                {/* Modal Footer */}
                <div className="flex-shrink-0 bg-gray-700 p-4 flex justify-end items-center gap-4 rounded-b-lg border-t border-gray-600">
                    <Button onClick={onClose} className="!bg-gray-600 hover:!bg-gray-500">{cancelText}</Button>
                    {onSecondaryAction && secondaryActionText && (
                        <Button onClick={onSecondaryAction} className={secondaryActionButtonClass}>
                            {secondaryActionText}
                        </Button>
                    )}
                    <Button onClick={onConfirm} className={confirmButtonClass}>
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};