import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import {
	getItems,
	createAvatar,
	AvatarType,
	Item,
	ItemType,
} from "../api/avatarApi";
import { Button } from "@/components/Register/ui/button";
import withAuth from "./withAuth";

const CreateAvatar: React.FC = () => {
	const router = useRouter();
	const [items, setItems] = useState<Item[]>([]);
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
	const [selectedCategory, setSelectedCategory] = useState<ItemType | "">(ItemType.BASE);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	useEffect(() => {
		fetchItems();
	}, []);

	useEffect(() => {
		if (items.length > 0) {
			const baseItem = items.find(item => item.type === ItemType.BASE && item.id === 1);
			if (baseItem) {
				setCustomization(prev => ({
					...prev,
					[ItemType.BASE]: baseItem
				}));
			}
		}
	}, [items]);

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

	const handleCreateAvatar = async () => {
		setIsLoading(true);
		setError(null);
		setSuccessMessage(null);
		try {
			const response = await createAvatar(
				AvatarType.BUSINESS,
				customization[ItemType.BASE]?.id || 1, // Use 1 as default if no base is selected
				customization[ItemType.HAT]?.id || null,
				customization[ItemType.SHIRT]?.id || null,
				customization[ItemType.BOTTOM]?.id || null,
			);
			
			setSuccessMessage('Avatar created successfully!');
			console.log('Created avatar:', response.avatar);
			console.log('Avatar ID:', response.avatarId);

			setTimeout(() => {
				router.push('/viewAvatars');
			}, 2000);
		} catch (error) {
			console.error('Error creating avatar:', error);
			setError('Failed to create avatar');
		} finally {
			setIsLoading(false);
		}
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

	return (
		<div className="container mx-auto p-6">
			<div className="flex justify-between items-center mb-2 mt-[-10px]">
				<Button onClick={handleBack} variant="outline">
					Back
				</Button>
				<h1 className="text-4xl font-bold text-zinc-700 text-center">
					Create Your Avatar
				</h1>
				<div className="w-[100px]"></div> {/* Spacer for alignment */}
			</div>

			<div className="flex flex-col items-center mt-4">
				<div className="relative">
					{customization[ItemType.BASE] && (
						<Image
							src={customization[ItemType.BASE].filepath}
							alt={customization[ItemType.BASE].name}
							width={170}
							height={170}
						/>
					)}
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
			</div>

			<div className="mt-6 flex justify-center space-x-4">
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

			<div className="mt-6 overflow-x-auto">
				<div className="mt-6 flex justify-center">
					{renderWardrobeItems()}
				</div>
			</div>

			<div className="mt-6 flex justify-center">
				<Button
					onClick={handleCreateAvatar}
					disabled={isLoading}
				>
					{isLoading ? "Creating..." : "Finish Creating Avatar"}
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

export default withAuth(CreateAvatar);