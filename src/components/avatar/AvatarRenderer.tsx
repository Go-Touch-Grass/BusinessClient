import React from 'react';
import Image from 'next/image';
import { ItemType, Item } from '@/api/itemApi';

interface AvatarRendererProps {
    customization: {
        [ItemType.BASE]: Item | null;
        [ItemType.HAT]: Item | null;
        [ItemType.SHIRT]: Item | null;
        [ItemType.BOTTOM]: Item | null;
    };
    width?: number;
    height?: number;
}

const AvatarRenderer: React.FC<AvatarRendererProps> = ({
    customization,
    width = 170,
    height = 170,
}) => {
    return (
        <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
            {customization[ItemType.BASE] && (
                <Image
                    src={customization[ItemType.BASE].filepath}
                    alt={customization[ItemType.BASE].name}
                    width={width}
                    height={height}
                />
            )}
            {customization[ItemType.HAT] && (
                <Image
                    src={customization[ItemType.HAT].filepath}
                    alt={customization[ItemType.HAT].name}
                    width={Math.round(width * 0.53)}
                    height={Math.round(height * 0.53)}
                    className="absolute"
                    style={{
                        top: `${Math.round(height * -0.029)}px`,
                        left: `${Math.round(width * 0.224)}px`,
                    }}
                />
            )}
            {customization[ItemType.BOTTOM] && (
                <Image
                    src={customization[ItemType.BOTTOM].filepath}
                    alt={customization[ItemType.BOTTOM].name}
                    width={Math.round(width * 0.94)}
                    height={Math.round(height * 0.59)}
                    className="absolute"
                    style={{
                        top: `${Math.round(height * 0.676)}px`,
                        left: `${Math.round(width * 0.029)}px`,
                    }}
                />
            )}
            {customization[ItemType.SHIRT] && (
                <Image
                    src={customization[ItemType.SHIRT].filepath}
                    alt={customization[ItemType.SHIRT].name}
                    width={Math.round(width * 0.62)}
                    height={Math.round(height * 0.54)}
                    className="absolute"
                    style={{
                        top: `${Math.round(height * 0.447)}px`,
                        left: `${Math.round(width * 0.188)}px`,
                    }}
                />
            )}
        </div>
    );
};

export default AvatarRenderer;
