import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
	getAvatarById,
	updateAvatar,
	AvatarInfo,
	AvatarType,
} from "../api/avatarApi";
import { ItemType, Item, getItems } from "../api/itemApi";
import { Button } from "@/components/Register/ui/button";
import withAuth from "./withAuth";
import AvatarRenderer from '@/components/avatar/AvatarRenderer';
import WardrobeSelector from '@/components/avatar/WardrobeSelector';

const EditAvatar: React.FC = () => {
	const router = useRouter();
	const { avatarId } = router.query;
	const [avatar, setAvatar] = useState<AvatarInfo | null>(null);
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
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedCategory, setSelectedCategory] = useState<ItemType | "">(ItemType.BASE);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [associatedEntity, setAssociatedEntity] = useState<string>("");

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
		setCustomization((prev) => {
			if (item.type === ItemType.BASE) {
				// For base, always equip the new item
				return { ...prev, [ItemType.BASE]: item };
			} else {
				// For other types, toggle between equipping and unequipping
				const isEquipped = prev[item.type]?.id === item.id;
				return {
					...prev,
					[item.type]: isEquipped ? null : item,
				};
			}
		});
	};

	const handleBack = () => {
		router.push("/viewAvatars");
	};

	const fetchAvatarDetails = async (id: string) => {
		try {
			const avatarId = Number(id);

			if (isNaN(avatarId)) {
				throw new Error("Invalid avatar ID");
			}

			const fetchedAvatar = await getAvatarById(avatarId);
			setAvatar(fetchedAvatar);

			setCustomization({
				[ItemType.BASE]: fetchedAvatar.base || null,
				[ItemType.HAT]: fetchedAvatar.hat || null,
				[ItemType.SHIRT]: fetchedAvatar.shirt || null,
				[ItemType.BOTTOM]: fetchedAvatar.bottom || null,
			});

			// Set the associated entity information
			if (fetchedAvatar.avatarType === AvatarType.BUSINESS_REGISTER_BUSINESS && fetchedAvatar.business_register_business) {
				setAssociatedEntity(`Business Registration ID: ${fetchedAvatar.business_register_business.registration_id}`);
			} else if (fetchedAvatar.avatarType === AvatarType.OUTLET && fetchedAvatar.outlet) {
				setAssociatedEntity(`Outlet ID: ${fetchedAvatar.outlet.outlet_id}`);
			} else {
				setAssociatedEntity("Unknown association");
			}
		} catch (error) {
			console.error("Error fetching avatar details:", error);
			setError("Failed to load avatar details");
		}
	};

	const handleSaveChanges = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const updatedInfo: {
				baseId?: number;
				hatId?: number;
				shirtId?: number;
				bottomId?: number;
			} = {
				baseId: customization[ItemType.BASE]?.id,
				hatId: customization[ItemType.HAT]?.id,
				shirtId: customization[ItemType.SHIRT]?.id,
				bottomId: customization[ItemType.BOTTOM]?.id,
			};

			const numericAvatarId = Number(avatarId);

			if (isNaN(numericAvatarId)) {
				throw new Error("Invalid avatar ID");
			}

			await updateAvatar(numericAvatarId, updatedInfo);
			setSuccessMessage("Avatar updated successfully!");
			setTimeout(() => {
				router.push("/viewAvatars");
			}, 2000);
		} catch (error) {
			console.error("Error updating avatar:", error);
			setError("Failed to save changes");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="container mx-auto p-6">
			<div className="flex justify-between items-center mb-2 mt-[-10px]">
				<Button onClick={handleBack} variant="outline">
					Back
				</Button>
				<h1 className="text-4xl font-bold text-zinc-700 text-center">
					Edit Avatar
				</h1>
				<div className="w-[100px]"></div>
			</div>

			{/* Add the associated entity information */}
			<div className="text-center mb-4">
				<p className="text-lg font-semibold text-gray-700">
					{associatedEntity}
				</p>
			</div>

			<div className="flex flex-col md:flex-row justify-center items-start gap-8 mt-8">
				<div className="flex flex-col items-center">
					<AvatarRenderer
						customization={customization}
						width={170}
						height={170}
					/>
				</div>

				<WardrobeSelector
					items={items}
					selectedCategory={selectedCategory}
					setSelectedCategory={setSelectedCategory}
					handleSelectItem={handleSelectItem}
					customization={customization}
				/>
			</div>

			<div className="p-10 mt-20 flex justify-center">
				<Button
					onClick={handleSaveChanges}
					disabled={isLoading}
					className="w-full md:w-auto px-4 py-2"
				>
					{isLoading ? "Saving..." : "Save Changes"}
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
