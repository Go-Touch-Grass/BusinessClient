import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const ConfirmationModal: React.FC<{
    isVisible: boolean;
    onClose: () => void;
    onConfirm: (contact: string) => void;
    outletContact: string;
    confirmationType: 'contact' | 'password' | 'alert';
    message: string | JSX.Element;
}> = ({ isVisible, onClose, onConfirm, outletContact, confirmationType, message }) => {
    const [input, setInput] = useState('');

    if (!isVisible) return null;

    const handleConfirm = () => {
        onConfirm(input);
        setInput('');
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
                <h3 className="text-xl font-semibold mb-4">
                    {confirmationType === 'password' ? 'Confirm Account Deletion' : 
                     confirmationType === 'contact' ? 'Confirm Delete Outlet' : 'Alert'}
                </h3>
                <div className="mb-4">{message}</div>

                {confirmationType !== 'alert' && (
                    <Input
                        placeholder={confirmationType === 'password' ? 'Enter password' : 'Enter contact number'}
                        type={confirmationType === 'password' ? 'password' : 'text'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full mb-4"
                    />
                )}
                <div className="flex justify-end space-x-4">
                    <Button 
                        onClick={onClose} 
                        className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
                    >
                        {confirmationType === 'alert' ? 'OK' : 'Cancel'}
                    </Button>
                    {confirmationType !== 'alert' && (
                        <Button 
                            onClick={handleConfirm} 
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Confirm
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
