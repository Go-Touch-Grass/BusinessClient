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
			// Determine the avatar type based on selected outlet
			let avatarType: AvatarType;
			let outletId: number | null = null;
			if (selectedOutlet) {
				avatarType = AvatarType.OUTLET;
				outletId = selectedOutlet; 
				
			} else if (businessRegistration) {
				avatarType = AvatarType.BUSINESS_REGISTER_BUSINESS;
			} else {
				console.error("No outlet or business registration selected");
				return;
			}
	
			const response = await createAvatar(
				avatarType,
				customization[ItemType.BASE]?.id || 1,
				customization[ItemType.HAT]?.id || null,
				customization[ItemType.SHIRT]?.id || null,
				customization[ItemType.BOTTOM]?.id || null,
				outletId
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

	const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedId = event.target.value ? parseInt(event.target.value) : null;
		setSelectedOutlet(selectedId);
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