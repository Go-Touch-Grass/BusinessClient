import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const ConfirmationModal: React.FC<{
    isVisible: boolean;
    onClose: () => void;
    onConfirm: (contact: string) => void;
    outletContact: string;
    confirmationType?: 'contact' | 'password';  // Add option to handle different confirmation types
}> = ({ isVisible, onClose, onConfirm, outletContact, confirmationType = 'contact' }) => {
    const [input, setInput] = useState('');

    if (!isVisible) return null;

    const handleConfirm = () => {
        onConfirm(input);
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
                <h3 className="text-xl font-semibold mb-4">Confirm {confirmationType === 'password' ? 'Account Deletion' : 'Delete Outlet'}</h3>
                <p className="mb-4">
                    {confirmationType === 'password'
                        ? 'This will delete all your data. Please enter your password to confirm account deletion:'
                        : 'Please enter the contact number to confirm deletion:'}
                </p>

                <Input
                    placeholder={confirmationType === 'password' ? 'Enter password' : 'Enter contact number'}
                    type={confirmationType === 'password' ? 'password' : 'text'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full mb-4"
                />
                <div className="flex justify-end space-x-4">
                    <Button onClick={onClose} className="bg-gray-300 hover:bg-gray-400">Cancel</Button>
                    <Button onClick={handleConfirm} className="bg-red-500 hover:bg-red-600">Confirm</Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;