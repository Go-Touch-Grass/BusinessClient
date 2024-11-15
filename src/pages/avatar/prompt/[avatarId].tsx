import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/Register/ui/button";
import withAuth from "@/pages/withAuth";
import { ChatMessage, createChatCompletion, createAvatarPrompt, updateAvatarPrompt, getAvatarPrompt } from "@/api/chatApi";
import AvatarRenderer from '@/components/avatar/AvatarRenderer';

interface ChatOption {
    id: number;
    text: string;
    type: 'dialogue' | 'shop' | 'farewell';
}

interface AssistantResponse {
    npc_response: string;
    available_options: ChatOption[];
}

const TuneChatPrompt: React.FC = () => {
    const router = useRouter();
    const { avatarId } = router.query;
    const [locationDescription, setLocationDescription] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avatarData, setAvatarData] = useState(null);
    const [promptId, setPromptId] = useState<number | null>(null);
    const [availableOptions, setAvailableOptions] = useState<ChatOption[]>([]);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (avatarId) {
            fetchAvatarData();
            fetchExistingPrompt();
        }
    }, [avatarId]);

    const fetchAvatarData = async () => {
        try {
            // Implement API call to fetch avatar data using avatarId
            // setAvatarData(response.data);
        } catch (error) {
            console.error("Error fetching avatar:", error);
            setError("Failed to fetch avatar data");
        }
    };

    const fetchExistingPrompt = async () => {
        if (!avatarId) return;

        try {
            const prompt = await getAvatarPrompt(avatarId);
            if (prompt) {
                setPromptId(prompt.id);
                setLocationDescription(prompt.prompt);
            }
        } catch (error) {
            console.error('Error fetching existing prompt:', error);
        }
    };

    const handleSendMessage = async (selectedOption?: ChatOption) => {
        if (!selectedOption || isLoading || !locationDescription.trim()) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: selectedOption.text
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setAvailableOptions([]);

        try {
            const response = await createChatCompletion({
                messages: [...messages, userMessage],
                locationDescription: locationDescription
            });

            let parsedResponse: AssistantResponse;
            if (typeof response.message === 'string') {
                parsedResponse = JSON.parse(response.message);
            } else {
                parsedResponse = response.message;
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: JSON.stringify(parsedResponse)
            }]);

            setAvailableOptions(parsedResponse.available_options || []);
        } catch (error) {
            console.error('Error handling message:', error);
            setError("Failed to send message");
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: JSON.stringify({
                    npc_response: 'Sorry, I encountered an error. Please try again.',
                    available_options: []
                })
            }]);
            setAvailableOptions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const startConversation = async () => {
        setHasStarted(true);
        await handleSendMessage({ id: 0, text: 'Hello', type: 'dialogue' });
    };

    const restartConversation = () => {
        setHasStarted(false);
        setMessages([]);
        setAvailableOptions([]);
    };

    const renderMessageContent = (message: ChatMessage) => {
        if (message.role === 'user') {
            return message.content;
        }

        try {
            const parsed = JSON.parse(message.content);
            return parsed.npc_response;
        } catch {
            return message.content;
        }
    };

    const renderOptions = () => (
        <div className="flex flex-wrap gap-2 mt-4">
            {availableOptions.map((option) => (
                <Button
                    key={option.id}
                    onClick={() => handleSendMessage(option)}
                    variant={option.type === 'farewell' ? 'destructive' : option.type === 'shop' ? 'outline' : 'default'}
                    className="text-sm"
                >
                    {option.text}
                </Button>
            ))}
        </div>
    );

    const handleSaveLocation = async () => {
        if (!avatarId || Array.isArray(avatarId) || !locationDescription.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const promptData: CreatePromptParams = {
                avatarId: Number(avatarId) || avatarId,
                prompt: locationDescription
            };

            if (promptId) {
                await updateAvatarPrompt(promptId, locationDescription);
            } else {
                const response = await createAvatarPrompt(promptData);
                setPromptId(response.id);
            }
        } catch (error) {
            console.error('Error saving location:', error);
            setError('Failed to save location description');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinish = () => {
        router.push('/viewAvatars');
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Tune Chat Prompt</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {avatarData && (
                        <AvatarRenderer
                            customization={avatarData.customization}
                            width={170}
                            height={170}
                        />
                    )}

                    <div>
                        <label className="block mb-2 font-semibold">
                            Chat Prompt:
                        </label>
                        <textarea
                            value={locationDescription}
                            onChange={(e) => setLocationDescription(e.target.value)}
                            className="w-full h-32 p-2 border rounded"
                            placeholder="Describe the personality and context for your avatar..."
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleSaveLocation} variant="outline">
                            Save Prompt
                        </Button>
                        <Button onClick={handleFinish}>
                            Finish
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        {hasStarted && (
                            <Button
                                onClick={restartConversation}
                                variant="outline"
                            >
                                Restart Chat
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="h-96 border rounded p-4 overflow-y-auto">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg ${msg.role === 'user'
                                    ? 'bg-blue-100 ml-auto'
                                    : 'bg-gray-100'
                                    } max-w-[80%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'
                                    } mb-4`}
                            >
                                <p className="text-sm font-semibold mb-1">
                                    {msg.role === 'user' ? 'You' : 'Assistant'}
                                </p>
                                <p className="text-gray-800">{renderMessageContent(msg)}</p>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="text-center text-gray-500">
                                Assistant is typing...
                            </div>
                        )}
                    </div>

                    <div className="px-4 py-4 border-t">
                        {!hasStarted ? (
                            <Button
                                onClick={startConversation}
                                disabled={!locationDescription.trim() || isLoading}
                                className="w-full"
                            >
                                Test Conversation
                            </Button>
                        ) : (
                            renderOptions()
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <p className="text-red-500 mt-4">{error}</p>
            )}
        </div>
    );
};

export default withAuth(TuneChatPrompt);