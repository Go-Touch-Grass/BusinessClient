import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import api from '@/api';

interface Subscription {
  title: string;
  description: string;
  duration: number;
  distance_coverage: number;
  total_cost: number;
  total_gem: number;
  outlet_id: number | null;
  activation_date: Date;
  expiration_date: Date;
}

const ViewSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renewError, setRenewError] = useState<string | null>(null); // For renewal errors

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const username = Cookies.get('username');
        if (!username) {
          setError('No username found in cookies');
          return;
        }
        const response = await api.get(`/api/business/subscription/${username}`);
        
        // Log response for debugging
        console.log('API response:', response.data);

        // Assuming the API returns a list of subscriptions
        setSubscriptions(response.data.subscriptions || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Error fetching subscriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const isButtonActive = (expirationDate: Date) => {
    const currentDate = new Date();
    return currentDate > new Date(expirationDate); // Button is active if current date is past expiration date
  };

  const renewSubscription = async (subscription: Subscription) => {
    try {
      const username = Cookies.get('username');
      if (!username) {
        setRenewError('No username found in cookies');
        return;
      }

      const response = await api.put('/api/business/renew_subscription', {
        username,
        outlet_id: subscription.outlet_id,
        duration: subscription.duration,
        distance_coverage: subscription.distance_coverage
      });

      console.log('Renewal response:', response.data);

      const currentDate = new Date();
      const newExpirationDate = new Date(currentDate);
      newExpirationDate.setMonth(currentDate.getMonth() + subscription.duration); 

      
      setSubscriptions((prevSubscriptions) =>
        prevSubscriptions.map((sub) =>
          sub.outlet_id === subscription.outlet_id
            ? {
                ...sub,
                activation_date: currentDate,
                expiration_date: newExpirationDate
              }
            : sub
        )
      );
    } catch (err) {
      console.error('Renewal error:', err);
      setRenewError('Error renewing subscription');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-green-100 to-white p-10">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl">
        <h2 className="text-3xl font-bold text-green-600 mb-6 text-center">My Subscriptions</h2>

        {renewError && <p className="text-red-600">{renewError}</p>} {/* Display renewal error */}

        {subscriptions.length === 0 ? (
          <p>No subscriptions found.</p>
        ) : (
          <div>
            {subscriptions.map((subscription, index) => (
              <div key={index} className="mb-6 p-4 bg-green-50 rounded-lg shadow-md">
                {subscription.outlet_id === null ? (
                  <h3 className="text-xl font-bold text-green-600">
                    Main Branch: {subscription.title}
                  </h3>
                ) : (
                  <h3 className="text-xl font-bold text-green-600">
                    Outlet #{subscription.outlet_id}: {subscription.title}
                  </h3>
                )}
                <p className="text-gray-700">{subscription.description}</p>
                <p>Duration: {subscription.duration} months</p>
                <p>Distance Coverage: {subscription.distance_coverage} km</p>
                <p>Total Cost: ${subscription.total_cost}</p>
                <p>Total Gems: {subscription.total_gem} Gems</p>
                <p>Activation Date: {new Date(subscription.activation_date).toLocaleDateString()}</p>
                <p>Expiration Date: {new Date(subscription.expiration_date).toLocaleDateString()}</p>

                {/* Button for renewing the subscription */}
                <button
                  onClick={() => renewSubscription(subscription)} // Call renew function with subscription
                  disabled={!isButtonActive(subscription.expiration_date)}
                  className={`mt-4 p-2 rounded ${
                    isButtonActive(subscription.expiration_date) ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isButtonActive(subscription.expiration_date) ? 'Renew Subscription' : 'Subscription Ongoing'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSubscriptions;
