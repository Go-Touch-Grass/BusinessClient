import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Button } from '@/components/Register/ui/button';
import api from '@/api';
import AvatarRenderer from '@/components/avatar/AvatarRenderer';
import withAuth from '../../pages/withAuth';
import { ItemType } from '../../api/itemApi';

interface Avatar {
  id: number;
  avatarType: string;
  engagement_count: number;
  base: Item | null;
  hat: Item | null;
  shirt: Item | null;
  bottom: Item | null;
  business_register_business?: BusinessRegistration | null;
  outlet?: Outlet | null;
}

interface Item {
  id: number;
  name: string;
  type: ItemType;
  filepath: string;
  status: string;
  remarks: string;
}

interface BusinessRegistration {
  registration_id: number;
  entityName: string;
  location: string;
}

interface Outlet {
  outlet_name: string;
  location: string;
}

const Engagement: React.FC = () => {
  const router = useRouter();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvatarEngagements();
  }, []);

  // Fetch avatar engagements from the API
  const fetchAvatarEngagements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/business-analytics/avatar-engagements');
      if (response.status === 200) {
        setAvatars(response.data.avatars);
      } else {
        setError('Failed to fetch avatar engagements');
      }
    } catch (err) {
      console.error('API call error:', err);
      setError('An error occurred while fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAvatar = (avatar: Avatar) => (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-between" style={{ width: '210px', height: '350px' }}>
      {/* Avatar Renderer */}
      <div className="w-[170px] h-[170px]">
        <AvatarRenderer
          customization={{
            [ItemType.BASE]: avatar.base || null,
            [ItemType.HAT]: avatar.hat || null,
            [ItemType.SHIRT]: avatar.shirt || null,
            [ItemType.BOTTOM]: avatar.bottom || null,
          }}
          width={170}
          height={170}
        />
      </div>

      {/* Text content section */}
      <div className="flex flex-col items-center mt-6">
        {/* Business/Outlet Name */}
        <h2 className="font-semibold text-lg text-center">
          {avatar.business_register_business
            ? avatar.business_register_business.entityName
            : avatar.outlet?.outlet_name || "Unnamed"}
        </h2>

        {/* Engagement Count */}
        <p className="mt-2 text-gray-500 text-center">
          Engagement Count: {avatar.engagement_count}
        </p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1>Avatar Engagements</h1>
      </div>

      {isLoading && (
        <p className="text-center mb-4">Loading avatar engagements...</p>
      )}

      {error && (
        <div className="text-red-500 text-center mb-4">
          <p>{error}</p>
          <button
            onClick={fetchAvatarEngagements}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && avatars.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {avatars.map((avatar) => (
            <div key={avatar.id}>{renderAvatar(avatar)}</div>
          ))}
        </div>
      )}

      {!isLoading && avatars.length === 0 && !error && (
        <p className="text-center mb-4">No engagements found.</p>
      )}
    </div>
  );
}

export default withAuth(Engagement);