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
    const renderItem = (item: Item | null, defaultWidth: number, defaultHeight: number, defaultTop: number, defaultLeft: number) => {
        if (!item) return null;

        const scale = item.scale ?? 1;
        const xOffset = item.xOffset ?? 0;
        const yOffset = item.yOffset ?? 0;

        const itemWidth = Math.round(defaultWidth * scale);
        const itemHeight = Math.round(defaultHeight * scale);
        const itemTop = Math.round(defaultTop + yOffset);
        const itemLeft = Math.round(defaultLeft + xOffset);

        return (
            <Image
                src={item.filepath}
                alt={item.name}
                width={itemWidth}
                height={itemHeight}
                className="absolute"
                style={{
                    top: `${itemTop}px`,
                    left: `${itemLeft}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                }}
            />
        );
    };

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
            {renderItem(
                customization[ItemType.HAT],
                Math.round(width * 0.53),
                Math.round(height * 0.53),
                Math.round(height * -0.029),
                Math.round(width * 0.224)
            )}
            {renderItem(
                customization[ItemType.BOTTOM],
                Math.round(width * 0.94),
                Math.round(height * 0.59),
                Math.round(height * 0.676),
                Math.round(width * 0.029)
            )}
            {renderItem(
                customization[ItemType.SHIRT],
                Math.round(width * 0.62),
                Math.round(height * 0.54),
                Math.round(height * 0.447),
                Math.round(width * 0.188)
            )}
        </div>
    );
};

export default AvatarRenderer;
