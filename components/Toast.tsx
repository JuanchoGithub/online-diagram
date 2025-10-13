import React from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'info' | 'error';
}

const TYPE_CLASSES = {
    success: 'bg-green-500',
    info: 'bg-blue-500',
    error: 'bg-red-500',
};


export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
    const baseClasses = "fixed bottom-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-out";
    const typeClass = TYPE_CLASSES[type] || TYPE_CLASSES.success;

    return (
        <div 
            className={`${baseClasses} ${typeClass}`}
            style={{
                animation: 'fadeInOut 3s forwards'
            }}
        >
            <style>{`
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(20px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(20px); }
                }
                .animate-fade-in-out {
                    animation: fadeInOut 3s ease-in-out;
                }
            `}</style>
            {message}
        </div>
    );
};