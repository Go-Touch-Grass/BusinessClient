import api from "@/api";
import Cookies from "js-cookie";

export enum ItemType {
	HAT = "hat",
	SHIRT = "shirt",
	BOTTOM = "bottom",
	BASE = "base", 
}

export interface Item {
	id: number;
	name: string;
	type: ItemType;
	filepath: string;
}

export interface Avatar {
	id: number;
	base: Item | null; // Add the base item
	hat: Item | null;
	shirt: Item | null;
	bottom: Item | null;
}

export interface AvatarInfo {
	id: number;
	avatarType: AvatarType;
	customer? : {id : number};
	business_register_business?: { registration_id: number };
	outlet?: { outlet_id : number }
	base?: Item; 
	hat?: Item;
	shirt?: Item;
	bottom?: Item;
}

export enum AvatarType {
	BUSINESS_REGISTER_BUSINESS = 'business_register_business',
    OUTLET = 'outlet',
    TOURIST = 'tourist'
}

const getAuthToken = (): string | null => {
	return Cookies.get("authToken") || null;
};

const authHeader = () => {
	const token = getAuthToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getItems = async (): Promise<Item[]> => {
	try {
		const response = await api.get("/api/items", {
			headers: authHeader(),
		});
		if (!Array.isArray(response.data)) {
			throw new Error("Invalid response format");
		}
		return response.data;
	} catch (error) {
		console.error("Error fetching items:", error);
		throw handleApiError(error);
	}
};

export const createAvatar = async (
	avatarType: AvatarType,
	baseId: number | null, // Add baseId parameter
	hatId: number | null,
	shirtId: number | null,
	bottomId: number | null,
	outletId: number | null
): Promise<{ avatar: AvatarInfo; avatarId: number }> => {
	try {
		const response = await api.post(
			"/api/avatars",
			{
				avatarType,
				baseId, 
				hatId,
				shirtId,
				bottomId,
				outletId
			},
			{ headers: authHeader() }
		);
		return response.data;
	} catch (error) {
		console.error("Error creating avatar:", error);
		throw handleApiError(error);
	}
};

/*
export const getBusinessAvatars = async (
	username: string
): Promise<Avatar[]> => {
	try {
		const response = await api.get(
			`/api/business/avatars/${username}`,
			{
				headers: authHeader(),
			}
		);
		if (!Array.isArray(response.data)) {
			throw new Error("Invalid response format");
		}
		return response.data;
	} catch (error) {
		console.error("Error fetching business avatars:", error);
		throw handleApiError(error);
	}
};
*/

export const getAvatarByBusinessRegistrationId = async (registrationId: number): Promise<AvatarInfo> => {
	try {
	  const response = await api.get(`/api/avatars/business/${registrationId}`, {
		headers: authHeader(),
	  });
	  return response.data;
	} catch (error: any) {
	  // Log detailed Axios error for more information
	  if (error.response) {
		console.error('Response error:', error.response.data); // Error from the server
		console.error('Response status:', error.response.status); // HTTP status code
		console.error('Response headers:', error.response.headers); // Headers
	  } else if (error.request) {
		console.error('Request error:', error.request); // Request was made but no response received
	  } else {
		console.error('Error message:', error.message); // Something else triggered the error
	  }
	  console.error('Config:', error.config); // Axios config details
	  throw handleApiError(error); // Existing error handler
	}
  };
  

  export const getAvatarByOutletId = async (outletId: number): Promise<AvatarInfo> => {
	try {
	  const response = await api.get(`/api/avatars/outlet/${outletId}`, {
		headers: authHeader(),
	  });
	  return response.data;
	} catch (error) {
	  console.error('Error fetching avatar by Outlet ID:', error);
	  throw handleApiError(error);
	}
  };

export const getAvatarById = async (id: number): Promise<AvatarInfo> => {
	try {
		const response = await api.get(`/api/avatars/${id}`, {
			headers: authHeader(),
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching avatar:", error);
		throw handleApiError(error);
	}
};

export const updateAvatar = async (
	avatarId: number,
	updatedInfo: {
		baseId?: number;
		hatId?: number;
		shirtId?: number;
		bottomId?: number;
	}
): Promise<AvatarInfo> => {
	try {
		const response = await api.put(
			`/api/avatars/${avatarId}`,
			updatedInfo,
			{
				headers: authHeader(),
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error updating avatar:", error);
		throw handleApiError(error);
	}
};

function handleApiError(error): Error {
	if (error.response) {
		console.error("Error response:", error.response.data);
		console.error("Error status:", error.response.status);
		return new Error(
			`Server error: ${
				error.response.data.message || "Unknown error"
			}`
		);
	} else if (error.request) {
		console.error("No response received:", error.request);
		return new Error("No response from server");
	} else {
		console.error("Error", error.message);
		return error;
	}
}
