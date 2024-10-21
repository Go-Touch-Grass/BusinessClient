import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/api'; // Assuming you have an axios instance for making API calls
import { format, parseISO } from 'date-fns';
import Modal from './modal'; // Import your Modal component

interface Transaction {
    id: string;
    voucherId: number;
    voucherName: string;
    customerId: number;
    customerName: string;
    purchaseDate: string;
    expirationDate: string;
    amountSpent: number;
    redeemed: "yes" | "pending" | "no";
    used?: boolean; // Make used optional for type safety
    gemSpent: number;
}

const ViewVoucherTransaction: React.FC = () => {
    const router = useRouter();
    const { listing_id } = router.query;

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [error, setError] = useState<string>('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [buttonLabel, setButtonLabel] = useState("Confirm");
    const [searchVoucherName, setSearchVoucherName] = useState<string>('');
    const [searchDate, setSearchDate] = useState<string>('');
    const [usedFilter, setUsedFilter] = useState<string>('all');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [hiddenTransactions, setHiddenTransactions] = useState<string[]>([]); // Track hidden transactions

    const fetchTransactions = async () => {
        if (listing_id) {
            try {
                const response = await api.get(`/api/business/vouchers/${listing_id}/transactions`, {
                    params: {
                        used: usedFilter === 'all' ? undefined : usedFilter
                    },
                });

                console.log("API Response:", response.data);
                if (response.status === 200) {

                    const fetchedTransactions = response.data.transactions.map((transaction: Transaction) => ({
                        ...transaction,
                        used: transaction.used ?? false, // Default to false if undefined
                    }));
                    setTransactions(fetchedTransactions);
                    setFilteredTransactions(fetchedTransactions);
                } else {
                    setError('Failed to fetch transactions');
                }
            } catch (error) {
                console.error('Error fetching transactions:', error);
                setError('An error occurred while fetching transactions');
            }
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [listing_id, usedFilter]);

    const filterTransactions = () => {
        let filtered = transactions;

        if (searchVoucherName) {
            filtered = filtered.filter(transaction =>
                transaction.voucherName.toLowerCase().includes(searchVoucherName.toLowerCase())
            );
        }

        if (searchDate) {
            filtered = filtered.filter(transaction =>
                format(parseISO(transaction.purchaseDate), 'yyyy-MM-dd') === searchDate
            );
        }

        setFilteredTransactions(filtered);
    };

    useEffect(() => {
        filterTransactions();
    }, [searchVoucherName, searchDate, transactions]);

    // Handle modal close action
    const handleDismiss = async () => {
        console.log('Dismiss button clicked');
        console.log('isExpiredVoucher:', isExpiredVoucher);
        console.log('selectedTransaction:', selectedTransaction);// Add this line for debugging
        if (isExpiredVoucher && selectedTransaction) {
            try {
                const transactionId = parseInt(selectedTransaction.id, 10);
                // API call to update the redeemed status to "no"
                const response = await api.put(`/api/business/redeem`, {
                    transactionId: transactionId,
                    redeemed: 'no', // Set to "no" if expired
                });
                if (response.status === 200) {
                    // Update local state after successful API call
                    setTransactions(prevTransactions =>
                        prevTransactions.map(transaction =>
                            transaction.id === selectedTransaction.id
                                ? { ...transaction, redeemed: 'no' } // Update redeemed status
                                : transaction
                        )
                    );
                    alert('Voucher status updated to not redeemed.');
                } else {
                    alert('Failed to update the voucher status.');
                }
            } catch (error) {
                console.error('Error updating voucher status:', error);
                alert('An error occurred while updating the voucher status.');
            }
        }
        setModalOpen(false);
        setIsExpiredVoucher(false); // Reset the state when the modal is closed
    };

    const handleClose = () => {
        setModalOpen(false); // Simply close the modal
        setIsExpiredVoucher(false); // Reset the expired state
    };

    // Handle modal button click action
    const handleModalButtonClick = async () => {
        console.log('selectedTransaction:', selectedTransaction);
        if (selectedTransaction) {
            try {
                const transactionId = parseInt(selectedTransaction.id, 10);
                const response = await api.put('/api/business/redeem', {
                    transactionId: transactionId,
                    redeemed: 'yes',
                });
                if (response.status === 200) {
                    setTransactions(prevTransactions =>
                        prevTransactions.map(transaction =>
                            transaction.id === selectedTransaction.id
                                ? { ...transaction, redeemed: 'yes' } // Update redeemed status
                                : transaction
                        )
                    );
                    alert('Voucher redeemed successfully!');
                } else {
                    alert('Failed to redeem the voucher.');
                }
            } catch (error) {
                console.error('Error redeeming the voucher:', error);
                alert('An error occurred while redeeming the voucher.');
            } finally {
                setModalOpen(false);
            }
        }
    };

    const handleMarkUsed = async (transactionId: string) => {
        try {
            // API call to update the `used` status
            const response = await api.put(`/api/business/vouchers/${transactionId}/mark-used`, {
                transactionId: transactionId, // Send the transactionId in the body
            });

            if (response.status === 200) {
                // Update local state after successful API call
                setTransactions(prevTransactions => {
                    return prevTransactions.map(transaction =>
                        transaction.id === transactionId
                            ? { ...transaction, used: true } // Mark as used
                            : transaction
                    );
                });
                alert('Transaction marked as used successfully!');
            } else {
                alert('Failed to mark the transaction as used.');
            }
        } catch (error) {
            console.error('Error marking transaction as used:', error);
            alert('An error occurred while marking the transaction as used.');
        }
    };


    const [isExpiredVoucher, setIsExpiredVoucher] = useState(false);

    // In the validateVoucher function, set isExpiredVoucher based on the expiration check
    const validateVoucher = (transaction: Transaction) => {
        const currentDate = new Date();
        const expirationDate = new Date(transaction.expirationDate);
        expirationDate.setHours(23, 59, 59, 999); // Set to end of the day

        if (currentDate > expirationDate) {
            setModalTitle('Voucher Expired');
            setModalMessage(`Voucher with ID ${transaction.id} has expired and cannot be redeemed.`);
            setButtonLabel('Dismiss');
            setIsExpiredVoucher(true); // Set to true for expired voucher
            setModalOpen(true);
            setSelectedTransaction(transaction);
        } else if (transaction.used) {
            setModalTitle('Voucher Already Redeemed');
            setModalMessage(`Voucher with ID ${transaction.id} has already been redeemed.`);
            setButtonLabel('Dismiss');
            setIsExpiredVoucher(false); // Set to false for not expired
            setModalOpen(true);
            setSelectedTransaction(transaction);
        } else {
            setModalTitle('Voucher Valid');
            setModalMessage(`Voucher with ID ${transaction.id} is valid. Do you want to redeem it?`);
            setButtonLabel('Redeem');
            setSelectedTransaction(transaction);
            setIsExpiredVoucher(false); // Set to false for valid voucher
            setModalOpen(true);
        }
    };




    return (
        <div className="container mx-auto px-4 py-10">
            <div className="bg-gray-50 shadow-lg rounded-lg p-8 mb-6">
                <h1 className="text-3xl font-semibold mb-4 text-gray-800 text-center">
                    Transaction Details for Voucher {listing_id}
                </h1>
                {error && <p className="text-red-600 text-center mb-4">{error}</p>}

                <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
                    <input
                        type="text"
                        placeholder="Search by Voucher Name"
                        value={searchVoucherName}
                        onChange={(e) => setSearchVoucherName(e.target.value)}
                        className="border p-2 rounded w-full md:w-1/3 mb-4 md:mb-0"
                    />
                    <input
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="border p-2 rounded w-full md:w-1/3"
                    />

                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTransactions
                    .filter(transaction => !hiddenTransactions.includes(transaction.id) && !transaction.used) // Exclude hidden and used transactions // Filter out hidden transactions
                    .map(transaction => {
                        return (
                            <div
                                key={transaction.id}
                                className="bg-white rounded-lg shadow-md transition-transform transform hover:scale-105 p-6"
                            >
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Transaction ID: {transaction.id}</h2>
                                <p className="text-gray-600 mb-1"><strong>Voucher Name:</strong> {transaction.voucherName}</p>
                                <p className="text-gray-600 mb-1"><strong>Customer Name:</strong> {transaction.customerName}</p>
                                <p className="text-gray-600 mb-1"><strong>Redeem Date:</strong> {format(parseISO(transaction.purchaseDate), 'MM/dd/yyyy')}</p>
                                <p className="text-gray-600 mb-1">
                                    <strong>Expiration Date:</strong> {transaction.expirationDate ? format(parseISO(transaction.expirationDate), 'MM/dd/yyyy') : 'Not Available'}
                                </p>
                                <p className={`text-gray-600 mb-1 ${transaction.redeemed === 'yes' ? 'text-green-600' : transaction.redeemed === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                                    <strong>Redeemed By Customer:</strong> {transaction.redeemed === 'yes' ? 'Yes' : transaction.redeemed === 'pending' ? 'Yes' : 'No'}
                                </p>

                                {/* Show the cross button only if the transaction is redeemed */}
                                {(transaction.redeemed === 'yes' || transaction.redeemed === 'no') && (
                                    <button
                                        onClick={() => handleMarkUsed(transaction.id)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                        title="Mark as Used"
                                    >
                                        &#10005; {/* Cross mark icon */}
                                    </button>
                                )}

                                {/* Button rendering logic */}
                                {transaction.redeemed === 'pending' ? (
                                    <button
                                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        onClick={() => validateVoucher(transaction)}
                                    >
                                        Approve Voucher
                                    </button>
                                ) : (
                                    <button
                                        className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                        onClick={() => validateVoucher(transaction)}
                                        disabled={transaction.redeemed === 'yes' || transaction.redeemed === 'no'}
                                    >
                                        {transaction.redeemed === 'yes'
                                            ? 'Already Redeemed'
                                            : transaction.redeemed === 'no'
                                                ? 'Voucher Rejected'
                                                : 'Redeem Voucher'}
                                    </button>
                                )}
                            </div>
                        );
                    })}

            </div>
            {/* Modal for redemption confirmation */}
            <Modal isOpen={modalOpen} onClose={handleClose}>
                <h2 className="text-lg font-bold mb-2">{modalTitle}</h2>
                <p className="mb-4">{modalMessage}</p>

                {/* Conditional rendering for expired voucher */}
                {isExpiredVoucher ? (
                    <>
                        <button onClick={handleDismiss}>Dismiss</button>

                        <button
                            className="ml-2 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            onClick={handleModalButtonClick}
                        >
                            {buttonLabel}
                        </button>
                        <button
                            className="ml-2 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                    </>
                )}
            </Modal>

        </div>
    );
};

export default ViewVoucherTransaction;
