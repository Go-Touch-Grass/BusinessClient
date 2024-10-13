import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    buttonLabel?: string; // Optional button label
    onButtonClick?: () => void; // Optional button click handler
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, message, buttonLabel, onButtonClick }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-5 shadow-lg w-1/3">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <p className="mb-4">{message}</p>
                <div className="flex justify-end">
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                        onClick={onClose}
                    >
                        Close
                    </button>
                    {buttonLabel && onButtonClick && (
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                            onClick={onButtonClick}
                        >
                            {buttonLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
