import api from "@/api";
import Cookies from "js-cookie";

export interface ChatMessage {
    role: string;
    content: string;
}

export interface ChatResponse {
    message: string;
    role: string;
    content?: string;
}

export interface ChatCompletionParams {
    messages: ChatMessage[];
    locationDescription: string;
}

export interface AvatarPrompt {
    id?: number;
    prompt: string;
    avatar?: any;
}

export interface CreatePromptParams {
    avatarId: number | string;
    prompt: string;
}

const getAuthToken = (): string | null => {
    return Cookies.get("authToken") || null;
};

const authHeader = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createChatCompletion = async (params: ChatCompletionParams): Promise<ChatResponse> => {
    try {
        const response = await api.post(
            "/api/chat",
            params,
            { headers: authHeader() }
        );
        return response.data;
    } catch (error) {
        console.error("Error creating chat completion:", error);
        throw handleApiError(error);
    }
};

export const createAvatarPrompt = async (params: CreatePromptParams): Promise<AvatarPrompt> => {
    try {
        const response = await api.post(
            "/api/avatars/business/prompt",
            params,
            { headers: authHeader() }
        );
        return response.data;
    } catch (error) {
        console.error("Error creating avatar prompt:", error);
        throw handleApiError(error);
    }
};

export const updateAvatarPrompt = async (promptId: number, prompt: string): Promise<AvatarPrompt> => {
    try {
        const response = await api.put(
            `/api/avatars/business/prompt/${promptId}`,
            { prompt },
            { headers: authHeader() }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating avatar prompt:", error);
        throw handleApiError(error);
    }
};

export const getAvatarPrompt = async (avatarId: number | string): Promise<AvatarPrompt> => {
    try {
        const response = await api.get(
            `/api/avatars/business/prompt/${avatarId}`,
            { headers: authHeader() }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching avatar prompt:", error);
        throw handleApiError(error);
    }
};

function handleApiError(error): Error {
    if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
        return new Error(
            `Server error: ${error.response.data.message || "Unknown error"}`
        );
    } else if (error.request) {
        console.error("No response received:", error.request);
        return new Error("No response from server");
    } else {
        console.error("Error", error.message);
        return error;
    }
}