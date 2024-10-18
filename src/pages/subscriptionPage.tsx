import { useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import api from '@/api';

const BusinessSubscription = () => {
    const [duration, setDuration] = useState(1);
    const [distance_coverage, setDistanceCoverage] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const router = useRouter();


    const pricing = {
        base: {
            1: { price: 50, gems: 500 },
            2: { price: 90, gems: 900 },
            3: { price: 120, gems: 1200 },
        },
        extra: {
            1: { price: 10, gems: 100 },
            2: { price: 18, gems: 180 },
            3: { price: 25, gems: 250 },
        },
    };

    const total_cost = pricing.base[duration].price + (pricing.extra[distance_coverage]?.price || 0);
    const total_gem = pricing.base[duration].gems + (pricing.extra[distance_coverage]?.gems || 0);

    const handleConfirm = async () => {
        setError(null);
        setLoading(true);
        setSuccessMessage(null);

        try {
            const username = Cookies.get('username'); // Get username from cookies
            if (!username) {
                setError('No username found in cookies');
                return;
            }

            const payload = {
                duration,
                distance_coverage,
                total_cost,
                total_gem,
                title: `${duration} Month Plan`,
                description: `Subscription for ${duration} month(s) with ${distance_coverage} km coverage.`,
            };


            console.log('Request Payload:', payload);

            const response = await api.post(`/api/business/subscription/${username}`, payload);

            if (response.status === 201) {
                await api.put(`/api/business/updateHasSubscription/${username}`, { hasSubscriptionPlan: true });
                setSuccessMessage('Subscription created successfully!');
                // Route to the subscription page after a short delay
                setTimeout(() => {
                    router.push('/viewSubscriptionPage');
                }, 0);
            } else {
                setError(`Failed to create subscription: ${response.data.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            setError('Not enough gems in your gem_balance.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-green-100 to-white p-10">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl">
                <h2 className="text-3xl font-bold text-green-600 mb-6 text-center">Main Branch Subscription Plan</h2>

                {error && <p className="text-red-600 text-center mb-4">{error}</p>}
                {successMessage && <p className="text-green-600 text-center mb-4">{successMessage}</p>}

                <div className="mb-6">
                    <label className="block text-lg font-medium text-gray-700 mb-2">Subscription Duration:</label>
                    <select
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="block w-full px-4 py-3 bg-green-100 border-2 border-green-400 rounded-md focus:outline-none focus:border-green-500"
                    >
                        <option value={1}>1 Month - $50 (500 Gems)</option>
                        <option value={2}>2 Months - $90 (900 Gems)</option>
                        <option value={3}>3 Months - $120 (1200 Gems)</option>
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-lg font-medium text-gray-700 mb-2">Extra Distance Coverage:</label>
                    <select
                        value={distance_coverage}
                        onChange={(e) => setDistanceCoverage(Number(e.target.value))}
                        className="block w-full px-4 py-3 bg-green-100 border-2 border-green-400 rounded-md focus:outline-none focus:border-green-500"
                    >
                        <option value={0}>No Extra Coverage</option>
                        <option value={1}>1 km - $10 (100 Gems)</option>
                        <option value={2}>2 km - $18 (180 Gems)</option>
                        <option value={3}>3 km - $25 (250 Gems)</option>
                    </select>
                </div>

                <div className="mb-6 bg-green-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold text-green-600">Summary</h3>
                    <p className="text-lg mt-2">
                        Total Price: <span className="font-bold">${total_cost}</span>
                    </p>
                    <p className="text-lg">
                        Total Gems: <span className="font-bold">{total_gem} Gems</span>
                    </p>
                </div>

                <button
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold text-lg transition-colors duration-200"
                    onClick={handleConfirm}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Confirm and Proceed to Payment'}
                </button>
            </div>
        </div>
    );
};

export default BusinessSubscription;
