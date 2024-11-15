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

const getAuthToken = (): string | null => {
    return Cookies.get("authToken") || null;
};

const authHeader = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createChatCompletion = async (messages: ChatMessage[]): Promise<ChatResponse> => {
    try {
        const response = await api.post(
            "/api/chat",
            { messages },
            { headers: authHeader() }
        );
        return response.data;
    } catch (error) {
        console.error("Error creating chat completion:", error);
        throw handleApiError(error);
    }
};

export const createStreamingChatCompletion = async (
    messages: ChatMessage[],
    onMessage: (data: ChatResponse) => void,
    onDone?: () => void
): Promise<void> => {
    try {
        const token = getAuthToken();
        const response = await fetch(`${api.defaults.baseURL}api/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ messages })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                onDone?.();
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            
            // Keep the last incomplete line in the buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') {
                        onDone?.();
                        return;
                    }
                    try {
                        const parsedData = JSON.parse(data);
                        onMessage({
                            message: parsedData.content || '',
                            role: parsedData.role
                        });
                    } catch (e) {
                        console.error('Error parsing SSE data:', e);
                    }
                }
            }
        }
    } catch (error: unknown) {
        console.error("Error in streaming chat completion:", error);
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