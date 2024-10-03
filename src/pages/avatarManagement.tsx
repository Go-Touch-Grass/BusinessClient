import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/Register/ui/button";
import withAuth from "./withAuth";
import { getBusinessAvatars } from "../api/avatarApi";
import Cookies from 'js-cookie';

const AvatarManagement: React.FC = () => {
	const router = useRouter();
	const [hasAvatars, setHasAvatars] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkAvatars = async () => {
			const username = Cookies.get('username');
			if (username) {
				try {
					const avatars = await getBusinessAvatars(username);
					setHasAvatars(avatars.length > 0);
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
						disabled={isLoading || !hasAvatars}
						title={!hasAvatars ? "No avatars available" : ""}
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