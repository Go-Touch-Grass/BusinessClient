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
    approved: boolean;
    business_register_business?: {
        id: number;
    };
    outlet?: {
        id: number;
    };
    scale?: number;
    xOffset?: number;
    yOffset?: number;
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

export const uploadCustomItem = async (
    file: File,
    name: string,
    type: ItemType,
    scale: number,
    xOffset: number,
    yOffset: number,
    businessRegistrationId?: number,
    outletId?: number
): Promise<Item> => {
    try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('name', name);
        formData.append('type', type);
        formData.append('scale', scale.toString());
        formData.append('xOffset', xOffset.toString());
        formData.append('yOffset', yOffset.toString());

        if (businessRegistrationId) {
            formData.append('businessRegistrationId', businessRegistrationId.toString());
        } else if (outletId) {
            formData.append('outletId', outletId.toString());
        }

        const response = await api.post("/api/items/upload", formData, {
            headers: {
                ...authHeader(),
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error uploading custom item:", error);
        throw handleApiError(error);
    }
};

function handleApiError(error): Error {
    if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
        return new Error(
            `Server error: ${error.response.data.message || "Unknown error"
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
