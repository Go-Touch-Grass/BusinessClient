import React, { useState } from 'react';
import AvatarRenderer from './AvatarRenderer';
import WardrobeSelector from './WardrobeSelector';
import { ItemType, Item } from '@/api/itemApi';

interface AvatarCustomizerProps {
    items: Item[];
}

const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ items }) => {
    const [customization, setCustomization] = useState<{
        [ItemType.BASE]: Item | null;
        [ItemType.HAT]: Item | null;
        [ItemType.SHIRT]: Item | null;
        [ItemType.BOTTOM]: Item | null;
    }>({
        [ItemType.BASE]: null,
        [ItemType.HAT]: null,
        [ItemType.SHIRT]: null,
        [ItemType.BOTTOM]: null,
    });
    const [selectedCategory, setSelectedCategory] = useState<ItemType | "">("");

    const handleSelectItem = (item: Item) => {
        setCustomization((prevCustomization) => {
            const isEquipped = prevCustomization[item.type]?.id === item.id;
            return {
                ...prevCustomization,
                [item.type]: isEquipped ? null : item, // Toggle between equipping and unequipping
            };
        });
    };

    return (
        <div className="flex flex-col items-center">
            <AvatarRenderer customization={customization} />
            <WardrobeSelector
                items={items}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                handleSelectItem={handleSelectItem}
                customization={customization}
            />
        </div>
    );
};

export default AvatarCustomizer;
