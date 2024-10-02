import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import {
    getItems,
	getAvatarById,
	updateAvatar,
	AvatarType,
	Item,
	ItemType,
    AvatarInfo
} from "../api/avatarApi";
import { Button } from "@/components/Register/ui/button";
import withAuth from "./withAuth";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'outline' | 'filled'; // Add more variants if needed
	isLoading?: boolean; // Add isLoading to props
}

const EditAvatar: React.FC = () => {
	const router = useRouter();
	const { avatarId } = router.query; // Get avatarId from query parameters
	const [avatar, setAvatar] = useState<AvatarInfo | null>(null);
	const [items, setItems] = useState<Item[]>([]);
	const [customization, setCustomization] = useState<{
		[ItemType.HAT]: Item | null;
		[ItemType.SHIRT]: Item | null;
		[ItemType.BOTTOM]: Item | null;
	}>({
		[ItemType.HAT]: null,
		[ItemType.SHIRT]: null,
		[ItemType.BOTTOM]: null,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<ItemType | "">(
		""
	);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

	useEffect(() => {
		if (avatarId) {
			fetchAvatarDetails(avatarId as string);
            fetchItems();
		}
	}, [avatarId]);

    const fetchItems = async () => {
		try {
			const fetchedItems = await getItems();
			setItems(fetchedItems);
		} catch (error) {
			console.error("Error fetching items:", error);
			setError("Failed to fetch items");
		}
	};

    const handleSelectItem = (item: Item) => {
		setCustomization((prev) => ({
			...prev,
			[item.type]: item,
		}));
	};

    const handleBack = () => {
		router.push('/avatarManagement');
	};

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
						className="cursor-pointer"
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

	const fetchAvatarDetails = async (id: string) => {
        try {
            const avatarId = Number(id);
    
            if (isNaN(avatarId)) {
                throw new Error("Invalid avatar ID");
            }
            
            const fetchedAvatar = await getAvatarById(avatarId);
            setAvatar(fetchedAvatar);
    
            // Set customization details
            setCustomization({
                [ItemType.HAT]: fetchedAvatar.hat || null,
                [ItemType.SHIRT]: fetchedAvatar.shirt || null,
                [ItemType.BOTTOM]: fetchedAvatar.bottom || null,
            });
        } catch (error) {
            console.error("Error fetching avatar details:", error);
            setError("Failed to load avatar details");
        }
    };

	const handleSaveChanges = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Create the updatedInfo object with the correct type
            const updatedInfo: {
                hatId?: number; // Change to number
                shirtId?: number; // Change to number
                bottomId?: number; // Change to number
            } = {
                hatId: customization[ItemType.HAT]?.id, 
                shirtId: customization[ItemType.SHIRT]?.id, 
                bottomId: customization[ItemType.BOTTOM]?.id 
            };
    
            // Ensure avatarId is a number
            const numericAvatarId = Number(avatarId);
    
            // Check if the conversion is valid
            if (isNaN(numericAvatarId)) {
                throw new Error("Invalid avatar ID");
            }
    
            // Pass the numeric avatarId to the updateAvatar function
            await updateAvatar(numericAvatarId, updatedInfo);
            router.push('/viewAvatars');
        } catch (error) {
            console.error("Error updating avatar:", error);
            setError("Failed to save changes");
        } finally {
            setIsLoading(false);
        }
    };

	const renderAvatarPreview = () => {
		return (
			<div className="relative">
				<Image
					src="/sprites/avatar_base.png"
					alt="Avatar"
					width={170}
					height={170}
				/>
				{customization[ItemType.HAT] && (
					<Image
						src={customization[ItemType.HAT].filepath}
						alt={customization[ItemType.HAT].name}
						width={90}
						height={90}
						className="absolute top-[-5px] left-[38px]"
					/>
				)}
				{customization[ItemType.BOTTOM] && (
					<Image
						src={customization[ItemType.BOTTOM].filepath}
						alt={customization[ItemType.BOTTOM].name}
						width={160}
						height={100}
						className="absolute top-[115px] left-[5px]"
					/>
				)}
				{customization[ItemType.SHIRT] && (
					<Image
						src={customization[ItemType.SHIRT].filepath}
						alt={customization[ItemType.SHIRT].name}
						width={105}
						height={91}
						className="absolute top-[76px] left-[32px]"
					/>
				)}
			</div>
		);
	};

	return (
		<div className="container mx-auto p-6">
            <Button onClick={handleBack} variant="outline">
					Back
			</Button>
			 <h1 className="text-4xl font-bold text-zinc-700 text-center">
                Edit Avatar
            </h1>

			{error && (
				<p className="text-red-500 text-center mb-4">{error}</p>
			)}

			<div className="flex justify-center">
				{renderAvatarPreview()}
			</div>

			{/* Wardrobe */}
            <div className="mt-6 flex justify-center space-x-4">
				<Button
					onClick={() =>
						setSelectedCategory(
							ItemType.HAT
						)
					}
					variant={
						selectedCategory ===
						ItemType.HAT
							? "default"
							: "outline"
					}
				>
					Hat
				</Button>
				<Button
					onClick={() =>
						setSelectedCategory(
							ItemType.SHIRT
						)
					}
					variant={
						selectedCategory ===
						ItemType.SHIRT
							? "default"
							: "outline"
					}
				>
					Upper Wear
				</Button>
				<Button
					onClick={() =>
						setSelectedCategory(
							ItemType.BOTTOM
						)
					}
					variant={
						selectedCategory ===
						ItemType.BOTTOM
							? "default"
							: "outline"
					}
				>
					Lower Wear
				</Button>
			</div>

			<div className="mt-6 overflow-x-auto">
				<div className="mt-6 flex justify-center">
					{renderWardrobeItems()}
				</div>
			</div>

			<div className="flex justify-center mt-6">
				<Button onClick={handleSaveChanges} variant="outline" disabled={isLoading}>
                {isLoading
						? "Creating..."
						: "Saved Avatar"}
				</Button>
			</div>
            {error && (
				<p className="text-red-500 text-center mt-4">
					{error}
				</p>
			)}
			{successMessage && (
				<p className="text-green-500 text-center mt-4">
					{successMessage}
				</p>
			)}
		</div>
	);
};

export default withAuth(EditAvatar);
