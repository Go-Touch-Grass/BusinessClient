import React from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/Register/ui/button";
import withAuth from "./withAuth";

const AvatarManagement: React.FC = () => {
	const router = useRouter();

	const handleCreateAvatar = () => {
		router.push('/createAvatar');
	};

	const handleViewAvatars = () => {
		router.push('/viewAvatars');
	};

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-4xl font-bold text-zinc-700 text-center mb-6">
				Avatar Management
			</h1>

			<div className="flex justify-center space-x-4">
				<Button onClick={handleCreateAvatar}>
					Create New Avatar
				</Button>
				<Button onClick={handleViewAvatars}>
					View Avatars
				</Button>
			</div>
		</div>
	);
};

export default withAuth(AvatarManagement);