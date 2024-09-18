import { useState } from 'react';
import { Input } from '../components/components/ui/input';
import { Button } from '../components/components/ui/button';
import { Label } from '../components/components/ui/label';
import { Textarea } from '../components/components/ui/textarea';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie'; // Import Cookies
import api from '@/api'; // Ensure this is correctly imported
import withAuth from './withAuth';

const AddOutletPage: React.FC = () => {
  const [outletName, setOutletName] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const username = Cookies.get('username'); // Get username from cookies
      if (!username) {
        setError('No username found in cookies');
        return;
      }

      const formData = new FormData();
      formData.append('outlet_name', outletName);
      formData.append('location', location);
      formData.append('contact', contact);
      formData.append('description', description);
      if (image) {
        formData.append('image', image);
      }

      const response = await api.post(`/api/business/outlets/${username}`, formData);


      if (response.status === 201) {
        console.log('Outlet added successfully');
        setSuccessMessage('Outlet added successfully'); // Redirect after successful creation
        router.push('/profile');
      } else {
        // Axios does not have a `json` method; use `response.data` instead
        setError(`Failed to add outlet: ${response.data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('An error occurred while submitting');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Add New Outlet</h1>
        <p className="text-gray-500">Fill in the details of the new outlet below.</p>
      </header>

      <div className="space-y-4">
        <div>
          <Label htmlFor="outlet_name">Outlet Name</Label>
          <Input
            id="outlet_name"
            value={outletName}
            onChange={(e) => setOutletName(e.target.value)}
            placeholder="Enter outlet name"
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Textarea
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter outlet location"
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="contact">Contact Number</Label>
          <Input
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Enter contact number"
            type="tel"
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a short description of the outlet"
            className="w-full"
          />
        </div>

        {/*<div>
          <Label htmlFor="image">Outlet Image</Label>
          <Input
            id="image"
            type="file"
            onChange={handleImageChange}
            className="w-full"
          />
        </div>*/}

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
        <div className="flex justify-end space-x-4">
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600"
          >
            {isSubmitting ? 'Submitting...' : 'Add Outlet'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default withAuth(AddOutletPage);
