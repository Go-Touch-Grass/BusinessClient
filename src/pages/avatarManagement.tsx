import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/Register/ui/button";
import withAuth from "./withAuth";
import { AvatarInfo, getAvatarByBusinessRegistrationId, getAvatarByOutletId  } from "../api/avatarApi";
import Cookies from 'js-cookie';

const AvatarManagement: React.FC = () => {
	const router = useRouter();
	const [hasAvatars, setHasAvatars] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	/*
	useEffect(() => {
		const checkAvatars = async () => {
			const registration_id = Cookies.get('registration_id');
			const outlet_id = Cookies.get('outlet_id');
	
			const regId = registration_id ? parseInt(registration_id, 10) : undefined;
			const outId = outlet_id ? parseInt(outlet_id, 10) : undefined;
	
			if (regId || outId) {
				try {
					let avatar: AvatarInfo | null = null;
	
					if (regId) {
						avatar = await getAvatarByBusinessRegistrationId(regId);
					}
					
					if (!avatar && outId) {
						avatar = await getAvatarByBusinessOutletId(outId);
					}
	
					// If either avatar exists for the business registration or outlet, setHasAvatars to true
					setHasAvatars(avatar !== null);
				} catch (error) {
					console.error("Error checking avatars:", error);
					setHasAvatars(false);
				} finally {
					setIsLoading(false);
				}
			} else {
				setIsLoading(false);
			}
		};
	
		checkAvatars();
	}, []);
	*/
	

	const handleCreateAvatar = () => {
		router.push('/createAvatar');
	};

	const handleViewAvatars = () => {
		router.push('/viewAvatars');
	};

	const handleCustomAvatar = () => {
		router.push('/customAvatar');
	};

	const handleCustomItem = () => {
		router.push('/customItem');
	};

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-4xl font-bold text-zinc-700 text-center mb-6">
				Avatar Management
			</h1>

			<div className="flex flex-col items-center space-y-4">
				<div className="flex justify-center space-x-4">
					<Button onClick={handleCreateAvatar}>
						Create New Avatar
					</Button>
					<Button 
						onClick={handleViewAvatars} 
						//disabled={isLoading || !hasAvatars}
						//title={!hasAvatars ? "No avatars available" : ""}
					>
						View Avatars
					</Button>
				</div>
				<div className="flex justify-center space-x-4">
					<Button onClick={handleCustomAvatar} variant="outline">
						Custom Avatar
					</Button>
					<Button onClick={handleCustomItem} variant="outline">
						Custom Item
					</Button>
				</div>
			</div>
		</div>
	);
};

export default withAuth(AvatarManagement);