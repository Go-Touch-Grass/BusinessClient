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
    redeemed: boolean;
}

const ViewVoucherTransaction = () => {
    const router = useRouter();
    const { listing_id } = router.query;

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [error, setError] = useState<string>('');
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalTitle, setModalTitle] = useState<string>('');
    const [modalMessage, setModalMessage] = useState<string>('');
    const [buttonLabel, setButtonLabel] = useState<string>('');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const [searchVoucherName, setSearchVoucherName] = useState<string>(''); // Search for voucher name
    const [searchDate, setSearchDate] = useState<string>(''); // Search for purchase date

    const fetchTransactions = async () => {
        if (listing_id) {
            try {
                const response = await api.get(`/api/business/vouchers/${listing_id}/transactions`);
                if (response.status === 200) {
                    setTransactions(response.data.transactions);
                    setFilteredTransactions(response.data.transactions); // Initialize filteredTransactions
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
    }, [listing_id]);

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

    const validateVoucher = (transaction: Transaction) => {
        const currentDate = new Date();
        const expDate = new Date(transaction.expirationDate);

        if (currentDate > expDate) {
            setModalTitle('Voucher Expired');
            setModalMessage('The voucher has expired.');
            setButtonLabel('Dismiss');
            setModalOpen(true);
        } else {
            setModalTitle('Voucher Valid');
            setModalMessage('The voucher is valid. Do you want to redeem it?');
            setButtonLabel('Redeem');
            setSelectedTransaction(transaction);
            setModalOpen(true);
        }
    };

    const handleModalButtonClick = async () => {
        if (selectedTransaction) {
            try {
                const transactionId = parseInt(selectedTransaction.id, 10);
                const response = await api.put('/api/business/redeem', {
                    transactionId: transactionId,
                    redeemed: true,
                });
                if (response.status === 200) {
                    setTransactions(prevTransactions =>
                        prevTransactions.map(transaction =>
                            transaction.id === selectedTransaction.id
                                ? { ...transaction, redeemed: true }
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

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="bg-gray-50 shadow-lg rounded-lg p-8 mb-6">
                <h1 className="text-3xl font-semibold mb-4 text-gray-800 text-center">
                    Transaction Details for Voucher {listing_id}
                </h1>
                {error && <p className="text-red-600 text-center mb-4">{error}</p>}

                {/* Search bar for voucher name and date */}
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
                {filteredTransactions.length === 0 ? (
                    <p className="text-center text-gray-500 col-span-full">No transactions found.</p>
                ) : (
                    filteredTransactions.map(transaction => (
                        <div key={transaction.id} className="bg-white rounded-lg shadow-md transition-transform transform hover:scale-105 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Transaction ID: {transaction.id}</h2>
                            <p className="text-gray-600 mb-1"><strong>Voucher Name:</strong> {transaction.voucherName}</p>
                            <p className="text-gray-600 mb-1"><strong>Customer Name:</strong> {transaction.customerName}</p>
                            <p className="text-gray-600 mb-1"><strong>Purchase Date:</strong> {format(parseISO(transaction.purchaseDate), 'MM/dd/yyyy')}</p>
                            <p className="text-gray-600 mb-1">
                                <strong>Expiration Date:</strong> {transaction.expirationDate ? format(parseISO(transaction.expirationDate), 'MM/dd/yyyy') : 'Not Available'}
                            </p>
                            <p className="text-gray-600 mb-1"><strong>Amount Spent:</strong> {transaction.amountSpent} Gems</p>
                            <p className={`text-gray-600 mb-1 ${transaction.redeemed ? 'text-green-600' : 'text-red-600'}`}>
                                <strong>Redeemed By customer:</strong> {transaction.redeemed ? 'Yes' : 'No'}
                            </p>

                            {transaction.redeemed && (
                                <button
                                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                                    onClick={() => validateVoucher(transaction)}
                                >
                                    Validate
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal with a button inside */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalTitle}
                message={modalMessage}
                buttonLabel={buttonLabel}
                onButtonClick={handleModalButtonClick}
            />
        </div>
    );
};

export default ViewVoucherTransaction;
