import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/Register/ui/button";
import withAuth from "./withAuth";
import { AvatarInfo, getAvatarByBusinessRegistrationId, getAvatarByOutletId  } from "../api/avatarApi";
import Cookies from 'js-cookie';
import { BusinessAccount } from "./profile";
import api from "@/api";

const AvatarManagement: React.FC = () => {
	const router = useRouter();
	const [hasAvatars, setHasAvatars] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [profile, setProfile] = useState<BusinessAccount>()

    useEffect(() => {
        const fetchProfile = async () => {
          try {
            const token = Cookies.get("authToken");
            if (!token) {
              console.error("No token found. Please log in.");
              return;
            }
            const response = await api.get(`/api/business/profile`);
            if (response.status === 200) {
              setProfile(response.data.business);
  
            } else {
				console.error(response.data.message || "Failed to fetch profile");
            }
          } catch (err) {
            console.error("An error occurred while fetching profile");
            console.error("API call error:", err);
          }
        };
    
        fetchProfile();
      }, []);

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

	const handleViewCustomItems = () => {
		router.push('/viewCustomItems');
	};

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-4xl font-bold text-zinc-700 text-center mb-6">
				Avatar Management
			</h1>
			<div className={`flex flex-col relative ${profile?.banStatus && "cursor-not-allowed"}`}>
			{profile?.banStatus && <div className="absolute bg-gray-400 w-full h-full font-bold opacity-90 p-10 flex flex-col justify-center items-center">
    <div>Your account has been locked by our admin due to the following reason(s):</div>
    <div>{profile.banRemarks}</div>
    <div>Please resolve the above issues to proceed further.</div>
    </div> }
			<div className="flex flex-col items-center space-y-4">
				<div className="flex justify-center space-x-4">
					<Button onClick={handleCreateAvatar}>
						Create New Avatar
					</Button>
					<Button onClick={handleViewAvatars} variant="outline">
						View Avatars
					</Button>
				</div>
				<div className="flex justify-center space-x-4">
					<Button onClick={handleCustomAvatar}>
						Upload Custom Avatar Base
					</Button>
					<Button onClick={handleCustomItem}>
						Upload Custom Item
					</Button>
					<Button onClick={handleViewCustomItems} variant="outline">
						View All Custom Assets
					</Button>
				</div>
			</div>
			</div>
		</div>
	);
};

export default withAuth(AvatarManagement);
