import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image'; // Using next.js's Image component for optimized images

interface Item {
  name: string;
  image: string; // Assuming URLs for web assets
}

// Sample wardrobe items
const hats: Item[] = [
  { name: 'Baseball Cap', image: require ('../assets/sprites/baseball_cap.png') },
  { name: 'Cowboy Hat', image: require ('../assets/sprites/cowboy_hat.png') },
];

const upperWear: Item[] = [
  { name: 'Love Shirt', image: require ('../assets/sprites/love_shirt.png') },
  { name: 'White Shirt', image: require ('../assets/sprites/white_shirt.png') },
];

const lowerWear: Item[] = [
  { name: 'Blue Skirt', image: require('../assets/sprites/blue_skirt.png') },
  { name: 'Purple Pants', image: require('../assets/sprites/purple_pants.png') },
];

const AvatarManagement: React.FC = () => {
  const router = useRouter();
  const [avatar, setAvatar] = useState('/images/avatar_base.png'); 
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

  // Function to handle avatar save
  const handleSaveAvatar = async () => {
    try {
      const response = {
        customer_account: 'sampleAccount', // Dummy response for now
        token: 'sampleToken',
      };

      if (response.customer_account && response.token) {
        console.log('Avatar saved with customization:', customization);
        router.push('/profile'); 
      }
    } catch (error) {
      console.error('Error saving avatar:', error);
    }
  };

  // Function to update the selected customization item
  const handleSelectItem = (category: string, item: Item) => {
    setCustomization((prev) => ({
      ...prev,
      [category]: item,
    }));
  };

  // Render wardrobe items based on the selected category
  const renderWardrobeItems = () => {
    let items: Item[] = [];
    if (selectedCategory === 'hat') items = hats;
    else if (selectedCategory === 'upperWear') items = upperWear;
    else if (selectedCategory === 'lowerWear') items = lowerWear;

    return (
      <div className='flex space-x-4 overflow-x-auto'>
        {items.map((item, index) => (
          <div key={index} onClick={() => handleSelectItem(selectedCategory, item)} className='cursor-pointer'>
            <Image src={item.image} alt={item.name} width={64} height={64} className='rounded border' />
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
              src={customization.hat.image}
              alt={customization.hat.name}
              width={90}
              height={90}
              className='absolute top-[-5px] left-[38px]' // Adjust these values to better position the hat
            />
          )}
          {/* Lower wear overlay */}
          {customization.lowerWear && (
            <Image
              src={customization.lowerWear.image}
              alt={customization.lowerWear.name}
              width={160}
              height={100}
              className='absolute top-[115px] left-[5px]' // Adjust these values as needed
            />
          )}
          {/* Upper wear overlay */}
          {customization.upperWear && (
            <Image
              src={customization.upperWear.image}
              alt={customization.upperWear.name}
              width={105}
              height={91}
              className='absolute top-[76px] left-[32px]' // Adjust these values as needed
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
        <div className='mt-6 flex justify-center'>
            {renderWardrobeItems()}
        </div>
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
