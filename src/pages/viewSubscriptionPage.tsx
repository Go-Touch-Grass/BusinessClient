import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import api from '@/api';
import { useRouter } from 'next/router';

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
  subscription_id: number;
}

const ViewSubscriptions = () => {

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renewError, setRenewError] = useState<string | null>(null); // For renewal errors
  const [endError, setEndError] = useState<string | null>(null); // For ending errors
  const router = useRouter();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const username = Cookies.get('username');
        if (!username) {
          setError('No username found in cookies');
          return;
        }
        const response = await api.get(`/api/business/subscription/${username}`);

        if (response.data.subscriptions && response.data.subscriptions.length > 0) {
          const fetchedSubscriptions: Subscription[] = response.data.subscriptions.map((sub: any) => {
            const activationDate = new Date(sub.activation_date);
            const expirationDate = new Date(sub.expiration_date);

            return {
              ...sub,
              activation_date: activationDate,
              expiration_date: expirationDate,
            };
          });

          setSubscriptions(fetchedSubscriptions);
        } else {
          setError('No active subscriptions found');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Error fetching subscriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);


  const enableAutoRenew = async (subscription: Subscription) => {
    try {
      const token = Cookies.get('authToken');
      if (!token) {
        setRenewError('No username found in cookies');
        return;
      }
      const subscriptionId = subscription.subscription_id;
      const shouldAutoRenew = true;


      const response = await api.put(`/api/business/update_subscription`, {

        subscription_id: subscriptionId,
        autoRenew: shouldAutoRenew,
      });

      if (response.status === 200) {
        alert('Auto Renew enabled successfully!');

        setSubscriptions((prev) =>
          prev.map((sub) =>
            sub.subscription_id === subscriptionId ? { ...sub, autoRenew: shouldAutoRenew } : sub
          )
        );
      } else {
        setRenewError('Failed to enable Auto Renew');
      }
    } catch (err) {
      console.error('Auto Renew error:', err);
      setRenewError('Error enabling Auto Renew');
    }
  };




  const calculateTimeLeft = (expirationDate: Date) => {
    const currentDate = new Date();
    const diff = expirationDate.getTime() - currentDate.getTime();


    console.log('Current Date:', currentDate);
    console.log('Expiration Date:', expirationDate);
    console.log('Time Difference (ms):', diff);


    if (diff < 0) {
      return 'Expired';
    }


    const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutesLeft = Math.floor((diff / (1000 * 60)) % 60);

    if (daysLeft > 0) {
      return `${daysLeft} days left`;
    } else if (hoursLeft > 0) {
      return `${hoursLeft} hours left`;
    } else {
      return `${minutesLeft} minutes left`;
    }
  };


  const isSubscriptionActive = (expirationDate: Date) => {
    const currentDate = new Date();
    return currentDate < expirationDate;
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
        distance_coverage: subscription.distance_coverage,
      });

      const currentDate = new Date();
      const newExpirationDate = new Date(currentDate);
      newExpirationDate.setMonth(currentDate.getMonth() + subscription.duration);

      setSubscriptions((prevSubscriptions) =>
        prevSubscriptions.map((sub) =>
          sub.outlet_id === subscription.outlet_id
            ? {
              ...sub,
              activation_date: currentDate,
              expiration_date: newExpirationDate,
            }
            : sub
        )
      );
    } catch (err) {
      console.error('Renewal error:', err);
      setRenewError('Error renewing subscription');
    }
  };

  const endSubscription = async (subscription: Subscription) => {
    try {
      const username = Cookies.get('username');
      if (!username) {
        setEndError('No username found in cookies');
        return;
      }

      const response = await api.delete('/api/business/end_subscription', {
        data: {
          username,
          outlet_id: subscription.outlet_id,
        },
      });


      if (response.status === 200) {
        setSubscriptions((prevSubscriptions) =>
          prevSubscriptions.filter((sub) => sub.outlet_id !== subscription.outlet_id)
        );
      }
    } catch (err) {
      console.error('End subscription error:', err);
      setEndError('Error ending subscription');
    }
  };


  const editSubscription = (subscription: Subscription) => {
    router.push({
      pathname: '/editSubscription',
      query: {
        subscription_id: subscription.subscription_id,
        title: subscription.title,
        description: subscription.description,
        duration: subscription.duration,
        distance_coverage: subscription.distance_coverage,
        total_cost: subscription.total_cost,
        total_gem: subscription.total_gem,
        outlet_id: subscription.outlet_id,
        activation_date: subscription.activation_date.toISOString(),
        expiration_date: subscription.expiration_date.toISOString(),
      },
    });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center bg-green-100 p-10 rounded-lg shadow-md text-center">
        <p className="text-2xl font-bold text-red-600">{error}</p>
        <p className="text-gray-600 mt-4">Please check back later or subscribe to a new plan.</p>
        <button
          className="mt-6 px-4 py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600"
          onClick={() => {
            router.push('/subscriptionPage');
          }}
        >
          Subscribe to a Plan
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-green-100 to-white p-10">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl">
        <h2 className="text-3xl font-bold text-green-600 mb-6 text-center">My Subscriptions</h2>

        {renewError && <p className="text-red-600">{renewError}</p>}
        {endError && <p className="text-red-600">{endError}</p>}

        {subscriptions.length === 0 ? (
          <p>No subscriptions found.</p>
        ) : (
          <div>
            {subscriptions.map((subscription, index) => (
              <div key={index} className="relative mb-6 p-4 bg-green-50 rounded-lg shadow-md">
                {/* Conditional heading based on outlet ID */}
                {subscription.outlet_id === null ? (
                  <h3 className="text-xl font-bold text-green-600">Main Branch: {subscription.title}</h3>
                ) : (
                  <h3 className="text-xl font-bold text-green-600">Outlet #{subscription.outlet_id}: {subscription.title}</h3>
                )}

                <p className="text-gray-700">{subscription.description}</p>
                <p>Duration: {subscription.duration} months</p>
                <p>Distance Coverage: {subscription.distance_coverage} km</p>
                <p>Total Cost: ${subscription.total_cost}</p>
                <p>Total Gems: {subscription.total_gem} Gems</p>
                <p>Activation Date: {new Date(subscription.activation_date).toLocaleDateString()}</p>
                <p>Expiration Date: {new Date(subscription.expiration_date).toLocaleDateString()}</p>

                <p className="text-green-700">{calculateTimeLeft(subscription.expiration_date)}</p>

                {/* Buttons section */}
                <div className="flex justify-between mt-4">
                  {/* Button for renewing the subscription */}
                  <button
                    onClick={() => renewSubscription(subscription)}
                    disabled={isSubscriptionActive(subscription.expiration_date)}
                    className={`p-2 rounded ${isSubscriptionActive(subscription.expiration_date) ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
                  >
                    {isSubscriptionActive(subscription.expiration_date) ? 'Ongoing' : 'Renew Subscription'}
                  </button>

                  {/* Button for ending the subscription */}
                  <button
                    onClick={() => endSubscription(subscription)}
                    className="p-2 rounded bg-red-500 text-white"
                  >
                    End Subscription
                  </button>

                  {/* Button for editing the subscription */}
                  <button
                    onClick={() => editSubscription(subscription)}
                    className="p-2 flex items-center outline outline-2 outline-green-600 text-green-600 rounded hover:bg-green-100"
                  >
                    Edit Subscription
                  </button>
                </div>

                {/* Enable Auto Renew button at the top right corner */}
                <button
                  onClick={() => enableAutoRenew(subscription)}
                  className="absolute top-4 right-4 p-1.5 rounded-md bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-sm font-medium shadow-md hover:from-yellow-600 hover:to-yellow-700 transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Enable Auto Renew
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
