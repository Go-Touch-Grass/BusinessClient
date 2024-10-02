import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/api';
import { AxiosError } from 'axios';

const EditSubscription = () => {
    const router = useRouter();
    const { query } = router;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(1); // Default to 1 month
    const [distanceCoverage, setDistanceCoverage] = useState(0); // Default to 0 km
    const [error, setError] = useState<string | null>(null);
    const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
    const [success, setSuccess] = useState(false); // Success state

    useEffect(() => {
        if (query) {
            setTitle(query.title as string);
            setDescription(query.description as string);
            const parsedDuration = Number(query.duration);
            const parsedDistance = Number(query.distance_coverage);

            setDuration(isNaN(parsedDuration) ? 1 : parsedDuration); // Default to 1 if NaN
            setDistanceCoverage(isNaN(parsedDistance) ? 0 : parsedDistance); // Default to 0 if NaN

            // Correctly get the subscription ID from the query
            const id = query.subscription_id ? Number(query.subscription_id) : null;
            setSubscriptionId(id);
        }
    }, [query]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure subscriptionId is set
        if (subscriptionId === null || isNaN(subscriptionId)) {
            setError('Subscription ID is required.');
            return;
        }

        try {
            const response = await api.put(`/api/business/update_subscription/${subscriptionId}`, {
                subscriptionId, // Include subscriptionId
                duration,
                distance_coverage: distanceCoverage,
            });

            console.log('Update response:', response.data);

            // Set success state to true and reset after 3 seconds
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false); // Reset success after 3 seconds
            }, 3000);

        } catch (err) {
            console.error('Update error:', err);
            const error = err as AxiosError;

            const errorMessage = error.response?.data as { message?: string };
            setError(errorMessage?.message || 'Error updating subscription');
            setSuccess(false); // Ensure success is reset if there's an error
        }
    };

    const isUpgradeAllowed = (newDuration: number) => {
        return newDuration > duration;
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-green-100 to-white p-10">
            <h2 className="text-3xl font-bold text-green-600 mb-6">Edit Subscription</h2>

            {/* Disclaimer Section */}
            <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                <p className="font-bold">Important:</p>
                <p>You can only upgrade your subscription duration or distance coverage. Downgrading is not allowed.</p>
            </div>

            {error && <p className="text-red-600">{error}</p>}
            {success && <p className="text-green-600 mb-4">Subscription updated successfully!</p>} {/* Success message */}

            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl">
                <div className="mb-4">
                    <label className="block text-gray-700">Title:</label>
                    <input
                        type="text"
                        value={title}
                        readOnly
                        className="border border-gray-300 rounded w-full p-2"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Description:</label>
                    <input
                        type="text"
                        value={description}
                        readOnly
                        className="border border-gray-300 rounded w-full p-2"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Duration (Months):</label>
                    <select
                        value={duration}
                        onChange={(e) => {
                            const newDuration = Number(e.target.value);
                            if (isUpgradeAllowed(newDuration)) {
                                setDuration(newDuration);
                            }
                        }}
                        className="border border-gray-300 rounded w-full p-2"
                    >
                        <option value={1}>1 Month</option>
                        <option value={2}>2 Months</option>
                        <option value={3}>3 Months</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Distance Coverage (km):</label>
                    <input
                        type="number"
                        value={distanceCoverage}
                        onChange={(e) => setDistanceCoverage(Number(e.target.value))}
                        className="border border-gray-300 rounded w-full p-2"
                    />
                </div>

                <button
                    type="submit"
                    className={`p-2 rounded text-white ${success ? 'bg-green-500' : 'bg-blue-500'}`}
                    disabled={success} // Disable button momentarily after success
                >
                    {success ? 'Updated!' : 'Update Subscription'}
                </button>
            </form>
        </div>
    );
};

export default EditSubscription;
