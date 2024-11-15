import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import {
	createAvatar,
	AvatarType,
} from "../api/avatarApi";
import { ItemType, Item, getItems } from "../api/itemApi";
import { Button } from "@/components/Register/ui/button";
import withAuth from "./withAuth";
import Cookies from 'js-cookie';
import api from '@/api';
import AvatarRenderer from '@/components/avatar/AvatarRenderer';
import WardrobeSelector from '@/components/avatar/WardrobeSelector';

interface Outlet {
    outlet_name: string;
    location: string;
    contact: string;
    description: string;
    outlet_id: number;
}

interface BusinessRegistration {
    registration_id: number;
    entityName: string;
    location: string;
    category: string;
    status: string;
    remarks: string;
    proof?: string;
}

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

	// Used to assign avatar to a certain outlet or registered business location
	const [outlets, setOutlets] = useState<Outlet[]>([]);
    const [businessRegistration, setBusinessRegistration] = useState<BusinessRegistration | null>(null);
    const [selectedOutlet, setSelectedOutlet] = useState<number | null>(null);

	useEffect(() => {
		fetchItems();
		fetchProfile();
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

	const fetchProfile = async () => {
        try {
            const token = Cookies.get('authToken');
            if (!token) {
                setError('No token found. Please log in.');
                return;
            }

            const response = await api.get(`/api/business/profile`);
            if (response.status === 200) {
                setOutlets(response.data.outlets);
                setBusinessRegistration(response.data.registeredBusiness);
            } else {
                setError(response.data.message || 'Failed to fetch profile');
            }
        } catch (err) {
            setError('An error occurred while fetching profile');
            console.error('API call error:', err);
        }
    };

	const handleSelectItem = (item: Item) => {
		setCustomization((prev) => {
			if (item.type === ItemType.BASE) {
				// If selecting a custom base, unequip all other items
				if (item.name === "Custom Avatar") {
					return {
						[ItemType.BASE]: item,
						[ItemType.HAT]: null,
						[ItemType.SHIRT]: null,
						[ItemType.BOTTOM]: null,
					};
				}
				// For non-custom base, just update the base
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

		// If selecting a custom base, reset the selected category to BASE
		if (item.type === ItemType.BASE && item.name === "Custom Avatar") {
			setSelectedCategory(ItemType.BASE);
		}
	};

	const handleCreateAvatar = async () => {
		setIsLoading(true);
		setError(null);
		setSuccessMessage(null);
		try {
			// Determine the avatar type based on selected outlet or business registration
			let avatarType: AvatarType;
			let outletId: number | null = null;
			let registrationId: number | null = null;

			if (selectedOutlet) {
				avatarType = AvatarType.OUTLET;
				outletId = selectedOutlet;
			} else if (businessRegistration) {
				avatarType = AvatarType.BUSINESS_REGISTER_BUSINESS;
				registrationId = businessRegistration.registration_id;
			} else {
				console.error("No outlet or business registration selected");
				setError("Please select an outlet or business registration");
				setIsLoading(false);
				return;
			}

			const response = await createAvatar(
				avatarType,
				customization[ItemType.BASE]?.id || 1,
				customization[ItemType.HAT]?.id || null,
				customization[ItemType.SHIRT]?.id || null,
				customization[ItemType.BOTTOM]?.id || null,
				outletId,
				registrationId
			);

			setSuccessMessage('Avatar created successfully!');
			console.log('Created avatar:', response.avatar);
			console.log('Avatar ID:', response.avatarId);

			router.push(`/avatar/prompt/${response.avatarId}`);

			// setTimeout(() => {
			// 	router.push('/viewAvatars');
			// }, 2000);
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

	const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedId = event.target.value ? parseInt(event.target.value) : null;
		setSelectedOutlet(selectedId);
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
				<div className="w-[100px]"></div>
			</div>

			{/* Dropdown to select outlet or business registration */}
			<div className="mb-6">
				<label htmlFor="entitySelect" className="block mb-2 font-semibold">Select Business/Outlet:</label>
				<select
					id="entitySelect"
					value={selectedOutlet !== null ? selectedOutlet.toString() : ""}
					onChange={handleSelectChange}
					className="border rounded p-2 w-full"
				>
					{businessRegistration && (
						<option value="">
							{businessRegistration.entityName} (Business Registration)
						</option>
					)}
					{outlets.map((outlet) => (
						<option key={outlet.outlet_id} value={outlet.outlet_id.toString()}> {/* Convert to string */}
								{outlet.outlet_name} (Outlet)
						</option>
					))}
				</select>
			</div>

			<div className="flex flex-col md:flex-row justify-center items-start gap-8">
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
					onClick={handleCreateAvatar}
					disabled={isLoading}
					className="w-full md:w-auto px-4 py-2"
				>
					{isLoading ? "Creating..." : "Next"}
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
