import api from "@/api";
import Cookies from "js-cookie";

export enum ItemType {
	HAT = "hat",
	SHIRT = "shirt",
	BOTTOM = "bottom",
	BASE = "base", // Add the new BASE type
}

export interface Item {
	id: number;
	name: string;
	type: ItemType;
	filepath: string;
}

export interface AvatarInfo {
	id: number;
	avatarType: AvatarType;
	business?: { id: number };
	base?: Item; // Add the base item
	hat?: Item;
	shirt?: Item;
	bottom?: Item;
}

export enum AvatarType {
	BUSINESS = "business",
	TOURIST = "tourist",
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
	bottomId: number | null
): Promise<{ avatar: AvatarInfo; avatarId: number }> => {
	try {
		const response = await api.post(
			"/api/avatars",
			{
				avatarType,
				baseId, // Include baseId in the request
				hatId,
				shirtId,
				bottomId,
			},
			{ headers: authHeader() }
		);
		return response.data;
	} catch (error) {
		console.error("Error creating avatar:", error);
		throw handleApiError(error);
	}
};

export interface Avatar {
	id: number;
	base: Item | null; // Add the base item
	hat: Item | null;
	shirt: Item | null;
	bottom: Item | null;
}

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
