import React from 'react';
import Image from 'next/image';
import { Button } from "@/components/Register/ui/button";
import { ItemType, Item } from '@/api/itemApi';

interface WardrobeSelectorProps {
    items: Item[];
    selectedCategory: ItemType | "";
    setSelectedCategory: (category: ItemType) => void;
    handleSelectItem: (item: Item) => void;
    customization: {
        [ItemType.BASE]: Item | null;
        [ItemType.HAT]: Item | null;
        [ItemType.SHIRT]: Item | null;
        [ItemType.BOTTOM]: Item | null;
    };
}

const WardrobeSelector: React.FC<WardrobeSelectorProps> = ({
    items,
    selectedCategory,
    setSelectedCategory,
    handleSelectItem,
    customization
}) => {
    const renderWardrobeItems = () => {
        const filteredItems = items.filter(
            (item) => item.type === selectedCategory
        );

        return (
            <div className="flex space-x-4 overflow-x-auto">
                {filteredItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className={`cursor-pointer ${customization[item.type]?.id === item.id ? 'border-2 border-green-500' : ''}`}
                    >
                        <Image
                            src={item.filepath}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="rounded border"
                        />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center w-full md:w-1/3">
            <div className="flex justify-between mb-6 w-full">
                <Button
                    onClick={() => setSelectedCategory(ItemType.BASE)}
                    variant={selectedCategory === ItemType.BASE ? "default" : "outline"}
                >
                    Base
                </Button>
                <Button
                    onClick={() => setSelectedCategory(ItemType.HAT)}
                    variant={selectedCategory === ItemType.HAT ? "default" : "outline"}
                >
                    Hat
                </Button>
                <Button
                    onClick={() => setSelectedCategory(ItemType.SHIRT)}
                    variant={selectedCategory === ItemType.SHIRT ? "default" : "outline"}
                >
                    Upper Wear
                </Button>
                <Button
                    onClick={() => setSelectedCategory(ItemType.BOTTOM)}
                    variant={selectedCategory === ItemType.BOTTOM ? "default" : "outline"}
                >
                    Lower Wear
                </Button>
            </div>

            <div className="w-full overflow-x-auto flex justify-center">
                {renderWardrobeItems()}
            </div>
        </div>
    );
};

export default WardrobeSelector;
