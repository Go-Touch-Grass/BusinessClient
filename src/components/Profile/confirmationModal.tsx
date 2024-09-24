import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const ConfirmationModal: React.FC<{
    isVisible: boolean;
    onClose: () => void;
    onConfirm: (contact: string) => void;
    outletContact: string;
}> = ({ isVisible, onClose, onConfirm, outletContact }) => {
    const [contact, setContact] = useState('');

    if (!isVisible) return null;

    const handleConfirm = () => {
        onConfirm(contact);
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
                <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
                <p className="mb-4">Please enter the contact number to confirm deletion:</p>
                <Input
                    placeholder="Enter contact number"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full mb-4"
                />
                <div className="flex justify-end space-x-4">
                    <Button onClick={onClose} className="bg-gray-300">Cancel</Button>
                    <Button onClick={handleConfirm} className="bg-red-500 text-white">Confirm</Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;