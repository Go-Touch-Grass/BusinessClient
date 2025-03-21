import { useEffect, useState, useCallback } from 'react';
import api from '@/api';
import { Label } from '../components/components/ui/label';
import { Input } from '../components/components/ui/input';
import { Button } from '../components/components/ui/button';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import withAuth from './withAuth';
import { useAuth } from "./AuthContext";
import ConfirmationModal from '../components/Profile/confirmationModal';
import { DataTable } from '@/components/components/global/DataTable';
import { loadStripe } from "@stripe/stripe-js";
import { ArrowUpDown } from 'lucide-react';
import { ColumnDef } from "@tanstack/react-table";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { priceDetails } from "./gemPurchase";
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export type Transaction = {
  currency_amount: string;
  gems_added: number;
  gems_deducted: number;
  transaction_date: string;
  transaction_id: number;
};
export interface BusinessAccount {

  firstName: string;
  lastName: string;
  email: string;
  username: string;
  gem_balance: number;
  min_gem_balance: number;
  banStatus: boolean;
  banRemarks: string;
  transactions: Transaction[]
}

interface Outlet {
  outlet_name: string;
  location: string;
  contact: string;
  description: string;
  outlet_id: number;
}

interface BusinessRegistration {
  registration_id: number;
  entityName: string;
  location: string;
  category: string;
  status: string;
  remarks: string;
  proof?: string;
}

// Update the Subscription interface
interface Subscription {
  subscription_id: number;
  title: string;
  description: string;
  activation_date: string;
  autoRenew: boolean;
  distance_coverage: number;
  duration: number;
  expiration_date: string;
  outlet: {
    outlet_id: number;
    outlet_name: string;
    location: string;
  } | null;
  outlet_id: number | null;
  status: string;
  total_cost: string;
  total_gem: string;
}

const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "transaction_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const dateValue = getValue() as string;
      return dateValue.substring(0, 10); // Display only the first 5 characters
    },
  },

  {
    accessorKey: "currency_amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Currency Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "gems_added",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Gems Added
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "gems_deducted",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Gems Deducted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const value = getValue();
      if (value == null) {
        return 0;
      }
      return value;
    },
  },
];

const ProfilePage: React.FC = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  const [profile, setProfile] = useState<BusinessAccount | null>(null);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [businessRegistration, setBusinessRegistration] = useState<BusinessRegistration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [profileImage, setProfileImage] = useState<string | null>(null); // For storing the profile image
  const [imagePreview, setImagePreview] = useState<string | null>(null); // For showing image preview

  const [formData, setFormData] = useState<BusinessAccount>({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    gem_balance: 0,
    min_gem_balance: 0,
    banStatus: false,
    banRemarks: "",
    transactions: []
  });
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null); // Store the selected outlet for deletion
  const [isOutletModalVisible, setIsOutletModalVisible] = useState<boolean>(false); // Modal for outlet deletion
  const [isAccountModalVisible, setIsAccountModalVisible] = useState<boolean>(false); // Modal for account deletion
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    if (!isLoggedIn) {
      setError('User is not logged in');
      return;
    }

    try {
      const username = Cookies.get('username');
      if (!username) {
        setError('No username found in cookies');
        return;
      }

      const response = await api.get(`/api/business/subscription/${username}`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('authToken')}` // Include the auth token
        }
      });

      if (response.status === 200) {
        setSubscriptions(response.data.subscriptions);
        console.log("subscriptions", response.data.subscriptions)
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);

    }
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = Cookies.get('authToken');
        if (!token) {
          setError('No token found. Please log in.');
          return;
        }
        //const response = await api.get(`/api/business/profile/${username}`);
        const response = await api.get(`/api/business/profile`);
        if (response.status === 200) {
          setProfile(response.data.business);
          console.log("profile image retrieved", response.data.business.profileImage);
          setProfileImage(response.data.business.profileImage); // Set the profile image
          setOutlets(response.data.outlets);
          setBusinessRegistration(response.data.registeredBusiness); // Set the business registration data
          setFormData(response.data.business);


        } else {
          setError(response.data.message || 'Failed to fetch profile');
        }
      } catch (err) {
        setError('An error occurred while fetching profile');
        console.error('API call error:', err);
      }
    };

    fetchProfile();
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  useEffect(() => {
    const recurringPayments = async (difference: number) => {
      console.log("amnt to top up: ", difference)

      // Find the index of the first price detail that covers the difference
      const index = priceDetails.findIndex(detail => detail.totalGems > difference);

      // If no suitable price detail is found, use the last (largest) option
      const priceDetail = index !== -1 ? priceDetails[index] : priceDetails[priceDetails.length - 1];

      if (!priceDetail) {
        console.error("No suitable price detail found");
        return;
      }

      const price = Number(priceDetail.price.substring(1))
      const gems = priceDetail.totalGems

      try {
        const { clientSecret, paymentIntentId } = await api
          .post("/api/payment/create-payment-intent", {
            amount: price * 100, // in cents
            currency: "sgd",
          })
          .then((response) => {
            console.log("paymentintent ", response.data)
            return (response.data)
          });

        if (!clientSecret || !paymentIntentId) {
          console.error("Error creating payment intent");
          return;
        }

        // Check if the user has a saved payment method
        const { paymentMethodId } = await api
          .get("/api/payment/get-payment-method-id")
          .then((response) => {
            console.log("payment method id,", response.data)
            return (response.data)
          });

        if (paymentMethodId) {
          // Use saved payment method
          const { error, paymentIntent } = await stripe!.confirmCardPayment(clientSecret, {
            payment_method: paymentMethodId,
          });

          if (error) {
            console.error(error.message || "Payment failed");
            return;
          }

          if (paymentIntent?.status === "succeeded") {
            await api.post("/api/business/verify_topup", {
              paymentIntentId,
              gemsAdded: gems,
            });
            console.log("Payment and top-up succeeded!");
          }
        } else {
          console.error("payment method missing id")

        }
      } catch (error) {
        console.error("An error occurred during payment processing:", error);
      }
    }

    if (profile && profile?.gem_balance < profile?.min_gem_balance) {
      const difference = profile?.min_gem_balance - profile?.gem_balance
      recurringPayments(difference)
    }
  }, [profile?.min_gem_balance])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(prev => !prev);
  };

  const handleUpdateProfile = async () => {

    if (!validateForm()) {
      return;
    }

    try {
      const token = Cookies.get('authToken');
      if (!token) {
        setError('No token found. Please log in.');
        return;
      }

      //const response = await api.put(`/api/business/profile/${username}`, formData);
      const response = await api.put(`/api/business/profile`, formData);
      if (response.status === 200) {

        setProfile(formData);
        setIsEditing(false);
        setError(null);
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating profile');
      console.error('API call error:', err);
    }
  };

  const [formErrors, setFormErrors] = useState<Partial<BusinessAccount>>({});

  const validateForm = () => {
    const errors: Partial<BusinessAccount> = {};
    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }
    if (!formData.email) {
      errors.email = 'Email is required';
    }
    if (!formData.username) {
      errors.username = 'Username is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleLogout = () => {
    clearAllCookies();
    router.push('/Login');
    setIsLoggedIn(false);
    console.log('Logout process initiated');

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.href);
      window.onpopstate = function () {
        router.replace("/");
      };
    }
  };



  const clearAllCookies = () => {
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach(cookieName => Cookies.remove(cookieName));
    console.log('All cookies cleared:', Cookies.get());
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); //store the image preview as base64
      };
      reader.readAsDataURL(file); // // Convert the image file to a base64 string for preview

      // Prepare to upload the image
      const formData = new FormData();
      formData.append('profileImage', file);

      /*formData.append('username', profile?.username || '');
      api.post(`/api/business/profile/${profile?.username}/uploadImage`, formData, {
          headers: {
              'Content-Type': 'multipart/form-data'  // for file uploads
          }
      })*/
      api.post(`/api/business/profile/uploadImage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'  // for file uploads
        }
      })
        .then(response => {
          setProfileImage(response.data.imagePath); // Save uploaded image path
          //setImagePreview(null);  // Clear preview after successful upload
        })
        .catch(error => {
          setError('Error uploading image');
          console.error(error);
        });
    }
  };
  console.log("Image Preview:", imagePreview);
  console.log("Profile Image Path:", profileImage);
  const handleDeleteOutlet = (outlet: Outlet) => {
    setSelectedOutlet(outlet);
    setIsOutletModalVisible(true);
  };
  const handleConfirmDeleteOutlet = async (contact: string) => {
    if (!selectedOutlet) return;

    // Check if the contact matches
    if (contact !== selectedOutlet.contact) {
      setAlertMessage("Contact number does not match. Deletion cancelled.");
      setIsAlertVisible(true);
      return;
    }

    try {
      const token = Cookies.get('authToken');
      if (!token) {
        setError('No token found. Please log in.');
        return;
      }

      const response = await api.delete(`/api/business/outlets/${selectedOutlet.outlet_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setOutlets(outlets.filter((outlet) => outlet.outlet_id !== selectedOutlet.outlet_id));
        setError(null);
        setAlertMessage('Outlet deleted successfully');
        setIsAlertVisible(true);
      } else {
        setError('Failed to delete outlet');
      }
    } catch (err) {
      console.error('API call error:', err);
      if (err.response) {
        setError(`Error: ${err.response.status} - ${err.response.data.message}`);
      } else if (err.request) {
        setError('No response received from server');
      } else {
        setError('An error occurred while deleting outlet');
      }
    }

    setSelectedOutlet(null);
    setIsOutletModalVisible(false);
  };

  const handleDeleteAccountButtonClick = () => {
    setIsAccountModalVisible(true); // Open the confirmation modal
  };
  const handleConfirmDeleteAccount = async (password: string) => {
    try {
      const token = Cookies.get('authToken');
      if (!token) {
        setError('No token found. Please log in.');
        return;
      }

      // Make the API call to delete the account
      const response = await api.delete(`/api/business/account`, {
        data: { password },
      });

      if (response.status === 200) {
        //clearAllCookies(); // Clear cookies on successful deletion
        //router.push('/'); // Redirect to the homepage after account deletion
        handleLogout(); // Log out the user
      } else {
        setError('Failed to delete account');
      }
    } catch (err) {
      setError('An error occurred while deleting your account');
      console.error('API call error:', err);
    }
  };

  const handleCreateOutletSubscription = async (outletId: number) => {
    if (!isLoggedIn) {
      setError('User is not logged in');
      return;
    }

    // Navigate to the outlet subscription page with the outlet ID
    router.push(`/outletSubscriptionPage?outlet=${outletId}`);
  };

  // Update this function to check for active business subscription
  const hasActiveBusinessSubscription = useCallback(() => {
    return subscriptions.some(sub =>
      sub.outlet_id === null &&
      sub.status === "active" &&
      new Date(sub.expiration_date) > new Date()
    );
  }, [subscriptions]);

  // Update this function to check for active outlet subscription
  const hasActiveOutletSubscription = useCallback((outletId: number) => {
    return subscriptions.some(sub =>
      sub.outlet_id === outletId &&
      sub.status === "active" &&
      new Date(sub.expiration_date) > new Date()
    );
  }, [subscriptions]);

  return (
    <div className='px-4 space-y-6 md:px-6'>
      <header className='space-y-1.5'>
        <div className='flex items-center space-x-4'>

          <img
            src={imagePreview || (profileImage ? `http://localhost:8080/${profileImage}` : '/images/profile.png')} // defualt image if failed to load
            alt='Profile'
            width='96'
            height='96'
            className='border rounded-full'
            style={{ aspectRatio: '96/96', objectFit: 'cover' }}
          />

          <div className='space-y-1.5'>
            <h1 className='text-2xl font-bold'>
              {profile ? `${profile.firstName} ${profile.lastName}` : 'Loading...'}
            </h1>
            <p className='text-gray-500 dark:text-gray-400'>
              {profile ? profile.username : ''}
            </p>
          </div>
        </div>
        <input type="file" accept=".jpg, .png" onChange={handleImageChange} />
      </header>

      <div className='space-y-6'>
        <div className='space-y-2'>
          <h1 className='text-lg font-semibold'>Personal Information</h1>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <Label htmlFor='firstName'>Representative's First Name</Label>
              <Input
                id='firstName'
                placeholder='Enter your first name'
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              {formErrors.firstName && <p className='text-red-500'>{formErrors.firstName}</p>}
            </div>

            <div>
              <Label htmlFor='lastName'>Representative's Last Name</Label>
              <Input
                id='lastName'
                placeholder='Enter your last name'
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              {formErrors.lastName && <p className='text-red-500'>{formErrors.lastName}</p>}
            </div>
            <div>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                placeholder='Enter your email'
                type='email'
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              {formErrors.email && <p className='text-red-500'>{formErrors.email}</p>}
            </div>
            <div>
              <Label htmlFor='username'>Username</Label>
              <Input
                id='username'
                placeholder='Enter your username'
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              {formErrors.username && <p className='text-red-500'>{formErrors.username}</p>}
            </div>
          </div>
        </div>



        <div className="flex flex-col relative">
          {profile?.banStatus && (
            <div className="absolute bg-gray-400 w-full h-full font-bold opacity-90 p-10 flex flex-col justify-center items-center">
              <div>
                Your account has been locked by our admin due to the following
                reason(s):
              </div>
              <div>{profile.banRemarks}</div>
              <div>Please resolve the above issues to proceed further.</div>
            </div>
          )}
          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-lg font-semibold'>Business Registration</h2>
              <Button
                className={`${businessRegistration?.status == 'approved' || businessRegistration?.status == 'pending'
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                onClick={() => router.push('/registerBusiness')}
                disabled={businessRegistration?.status == 'pending' || businessRegistration?.status == 'approved'}  // Disable 
              >
                + Register New Business
              </Button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {!businessRegistration ? (
                <p>No business registration found.</p>
              ) : (
                <div key={businessRegistration.entityName} className='border p-4 rounded-lg'>

                  <div className='flex justify-between items-center mb-10'>
                    <h3 className='text-xl font-semibold'>{businessRegistration.entityName}</h3>
                    {/* Edit Outlet Button */}
                    <Button
                      onClick={() => router.push(`/editRegisterBusiness?registrationId=${businessRegistration.registration_id}`)}
                      className='bg-green-500 hover:bg-green-600 text-white'
                    >
                      Edit
                    </Button>
                  </div>
                  <p><strong>Location:</strong> {businessRegistration.location}</p>
                  <p><strong>Category:</strong> {businessRegistration.category}</p>
                  <p><strong>Status:</strong> {businessRegistration.status}</p>
                  <p><strong>Remarks:</strong> {businessRegistration.remarks}</p>
                  {businessRegistration.proof && (
                    <a href={`http://localhost:8080/${businessRegistration.proof}`} target="_blank" rel="noopener noreferrer">
                      View Proof {/* noopener: prevents new page from accessing or controlling original page. 
                                                       noreferrer: prevents sending of origin URL to the external site.*/}
                    </a>
                  )}

                  <div className='mt-4 flex justify-end'>
                    <Button
                      className={`${businessRegistration?.status === 'approved' && !hasActiveBusinessSubscription()
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-gray-300 cursor-not-allowed'
                        } text-white`}
                      onClick={() => router.push('/subscriptionPage')}
                      disabled={
                        businessRegistration?.status !== 'approved' ||
                        hasActiveBusinessSubscription()
                      }
                    >
                      {hasActiveBusinessSubscription() ? 'Subscription Active' : 'Create Subscription Plan'}
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-lg font-semibold'>Your Outlets</h2>

              {/* Existing Add Outlet Button */}
              <Button
                className={`${businessRegistration?.status === 'approved'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-300 cursor-not-allowed'
                  } text-white`}
                onClick={() => router.push('/addOutlet')}
                disabled={businessRegistration?.status !== 'approved'}
              >
                + Add New Outlet
              </Button>
            </div>

            {/* Display reason why the button is disabled */}
            {businessRegistration === null ? (
              <p className="text-sm text-gray-500">
                You cannot add an outlet because you haven't registered your business yet.
              </p>
            ) : businessRegistration.status !== 'approved' && (
              <p className="text-sm text-gray-500">
                You cannot add an outlet because your business registration is currently <strong>{businessRegistration.status}</strong>.
              </p>
            )}
            <ConfirmationModal
              isVisible={isOutletModalVisible}
              onClose={() => setIsOutletModalVisible(false)}
              onConfirm={handleConfirmDeleteOutlet}
              outletContact={selectedOutlet?.contact || ''}
              confirmationType="contact"
              message={
                <>
                  <p><strong>Warning:</strong></p>
                  <p>Deleting this outlet will:</p>
                  <ul className="list-disc list-inside mb-2">
                    <li>End all associated subscriptions</li>
                    <li>Delete all related vouchers</li>
                    <li>Cause customers to lose unused vouchers. (<i>Your business will be charged for a full refund!)</i></li>
                  </ul>
                  <p>This action is not reversible.</p>
                  <p className="mt-2">Please enter the outlet contact number to confirm deletion:</p>
                </>
              }
            />
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {outlets.length === 0 ? (
                <p>No outlets found.</p>
              ) : (
                outlets.map(outlet => (
                  <div key={outlet.outlet_id} className='border p-4 rounded-lg'>

                    <div className='flex justify-between items-center mb-10'>
                      <h3 className='text-xl font-semibold'>{outlet.outlet_name}</h3>
                      {/* Edit Outlet Button */}
                      <Button
                        onClick={() => router.push(`/editOutlet?outletId=${outlet.outlet_id}`)}
                        className='bg-green-500 hover:bg-green-600 text-white'
                      >
                        Edit Outlet
                      </Button>
                    </div>
                    <p><strong>Location:</strong> {outlet.location}</p>
                    <p><strong>Contact:</strong> {outlet.contact}</p>
                    <p><strong>Description:</strong> {outlet.description}</p>
                    <div className='flex justify-between mt-4'> {/* Align to right */}
                      <Button onClick={() => handleDeleteOutlet(outlet)} className='bg-red-500 hover:bg-red-600'>Delete Outlet</Button>
                      <Button
                        className={`${!hasActiveOutletSubscription(outlet.outlet_id)
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : 'bg-gray-300 cursor-not-allowed'} text-white`}
                        onClick={() => handleCreateOutletSubscription(outlet.outlet_id)}
                        disabled={hasActiveOutletSubscription(outlet.outlet_id)}
                      >
                        {hasActiveOutletSubscription(outlet.outlet_id)
                          ? 'Subscription Active'
                          : 'Create Subscription Plan'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <hr className="flex my-10" />
        <div className="space-y-6">
          <b>Past Transactions</b>
          <p>Current Gem Balance: {formData.gem_balance}</p>
          {profile && <DataTable columns={transactionColumns} data={profile?.transactions} />}
        </div>
        <div className='flex space-x-4'>
          <Button onClick={handleEditToggle}>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
          {isEditing && (
            <Button onClick={handleUpdateProfile} className='bg-green-600 hover:bg-green-600'>
              Save Changes
            </Button>
          )}
          <Button onClick={handleLogout} className='bg-red-500 hover:bg-red-600'>
            Log Out
          </Button>
          <Button onClick={handleDeleteAccountButtonClick} className='bg-red-500 hover:bg-red-600'>
            Delete Account
          </Button>
        </div>
        {/* Modal for delete account confirmation */}
        <ConfirmationModal
          isVisible={isAccountModalVisible}
          onClose={() => setIsAccountModalVisible(false)}
          onConfirm={handleConfirmDeleteAccount} // Pass handleDeleteAccount for confirmation
          outletContact="" // Not needed for account deletion, but modal expects it
          confirmationType="password" // Specify that this modal should collect password
          message="This will delete your account and all associated data. Please enter your password to confirm account deletion:"
        />

        <ConfirmationModal
          isVisible={isAlertVisible}
          onClose={() => setIsAlertVisible(false)}
          onConfirm={() => setIsAlertVisible(false)}
          outletContact=""
          confirmationType="alert"
          message={alertMessage || ''}
        />
        {error && <p className='text-red-500 text-sm'>{error}</p>}
      </div >
    </div >
  );
};

const ProfileWrapper: React.FC = () => (
  <Elements stripe={stripePromise}>
    <ProfilePage />
  </Elements>
);

export default withAuth(ProfileWrapper);