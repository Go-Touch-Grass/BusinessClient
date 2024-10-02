import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Image from 'next/image';

interface Item {
  id: number;
  name: string;
  type: 'hat' | 'upperWear' | 'lowerWear';
  filepath: string;
}

const AvatarManagement: React.FC = () => {
  const router = useRouter();
  const [avatar, setAvatar] = useState('/images/base_avatar.png'); // Default base avatar
  const [items, setItems] = useState<Item[]>([]);
  const [customization, setCustomization] = useState<{
    hat: Item | null;
    upperWear: Item | null;
    lowerWear: Item | null;
  }>({
    hat: null,
    upperWear: null,
    lowerWear: null,
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Fetch the avatar customization (if available)
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await axios.get('/api/avatar'); // Fetch avatar data (GET request)
        const { hatId, upperWearId, lowerWearId, avatarId } = response.data;

        if (avatarId) {
          // Fetching corresponding items based on avatar data
          const [hat, upperWear, lowerWear] = await Promise.all([
            hatId ? axios.get(`/api/item/${hatId}`) : null,
            upperWearId ? axios.get(`/api/item/${upperWearId}`) : null,
            lowerWearId ? axios.get(`/api/item/${lowerWearId}`) : null,
          ]);

          setCustomization({
            hat: hat?.data || null,
            upperWear: upperWear?.data || null,
            lowerWear: lowerWear?.data || null,
          });
        } else {
          setAvatar('/images/base_avatar.png'); // Default base avatar
        }
      } catch (error) {
        console.error('Error fetching avatar data:', error);
      }
    };

    fetchAvatar();
  }, []);

  // Fetch available wardrobe items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('/api/items'); // Fetch all available items
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

  // Save or update avatar
  const handleSaveAvatar = async () => {
    try {
      const avatarData = {
        hatId: customization.hat?.id || null,
        upperWearId: customization.upperWear?.id || null,
        lowerWearId: customization.lowerWear?.id || null,
      };

      if (avatar === '/images/base_avatar.png') {
        // New avatar creation (POST request)
        const response = await axios.post('/api/avatar', avatarData);
        console.log('New avatar created:', response.data);
      } else {
        // Update existing avatar (PUT request)
        const response = await axios.put('/api/avatar', avatarData);
        console.log('Avatar updated:', response.data);
      }

      router.push('/profile'); // Navigate to the profile page after saving
    } catch (error) {
      console.error('Error saving avatar:', error);
    }
  };

  // Update customization based on selected item
  const handleSelectItem = (category: string, item: Item) => {
    setCustomization((prev) => ({
      ...prev,
      [category]: item,
    }));
  };

  // Filter and render wardrobe items based on the selected category
  const renderWardrobeItems = () => {
    const filteredItems = items.filter((item) => item.type === selectedCategory);

    return (
      <div className='flex space-x-4 overflow-x-auto'>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleSelectItem(selectedCategory, item)}
            className='cursor-pointer'
          >
            <Image
              src={item.filepath}
              alt={item.name}
              width={64}
              height={64}
              className='rounded border'
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className='container mx-auto p-6'>
      {/* Title section */}
      <h1 className='text-4xl font-bold text-zinc-700 text-center mb-2 mt-[-10px]'>
        Avatar Management
      </h1>

      {/* Avatar Display */}
      <div className='flex flex-col items-center mt-4'>
        <div className='relative'>
          {/* Base avatar */}
          <Image src={avatar} alt='Avatar' width={170} height={170} />
          {/* Hat overlay */}
          {customization.hat && (
            <Image
              src={customization.hat.filepath}
              alt={customization.hat.name}
              width={90}
              height={90}
              className='absolute top-[-5px] left-[38px]'
            />
          )}
          {/* Lower wear overlay */}
          {customization.lowerWear && (
            <Image
              src={customization.lowerWear.filepath}
              alt={customization.lowerWear.name}
              width={160}
              height={100}
              className='absolute top-[115px] left-[5px]'
            />
          )}
          {/* Upper wear overlay */}
          {customization.upperWear && (
            <Image
              src={customization.upperWear.filepath}
              alt={customization.upperWear.name}
              width={105}
              height={91}
              className='absolute top-[76px] left-[32px]'
            />
          )}
        </div>
      </div>

      {/* Category Selection */}
      <div className='mt-6 flex justify-center space-x-4'>
        <button
          className={`px-4 py-2 rounded ${selectedCategory === 'hat' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedCategory('hat')}
        >
          Hat
        </button>
        <button
          className={`px-4 py-2 rounded ${selectedCategory === 'upperWear' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedCategory('upperWear')}
        >
          Upper Wear
        </button>
        <button
          className={`px-4 py-2 rounded ${selectedCategory === 'lowerWear' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedCategory('lowerWear')}
        >
          Lower Wear
        </button>
      </div>

      {/* Wardrobe Items */}
      <div className='mt-6 overflow-x-auto'>
        <div className='mt-6 flex justify-center'>{renderWardrobeItems()}</div>
      </div>

      {/* Save Avatar Button */}
      <div className='mt-6'>
        <button onClick={handleSaveAvatar} className='bg-green-500 text-white px-6 py-2 rounded'>
          Save Avatar
        </button>
      </div>
    </div>
  );
};

export default AvatarManagement;
