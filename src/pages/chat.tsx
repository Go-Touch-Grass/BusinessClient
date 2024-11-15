import React, { useState } from 'react';
import { Button } from "@/components/Register/ui/button";
import withAuth from "./withAuth";
import { ChatMessage, createChatCompletion } from '@/api/chatApi';

// Add new types
interface ChatOption {
    id: number;
    text: string;
    type: 'dialogue' | 'shop' | 'farewell';
}

interface AssistantResponse {
    npc_response: string;
    available_options: ChatOption[];
}

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [locationDescription, setLocationDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [availableOptions, setAvailableOptions] = useState<ChatOption[]>([]);
    const [hasStarted, setHasStarted] = useState(false);

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

            // Check if response.message is already an object
            let parsedResponse: AssistantResponse;
            if (typeof response.message === 'string') {
                try {
                    parsedResponse = JSON.parse(response.message);
                } catch (parseError) {
                    console.error('Parse error:', parseError);
                    throw new Error('Invalid response format');
                }
            } else {
                parsedResponse = response.message;
            }

            // Update messages and options with the parsed response
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: parsedResponse.npc_response 
            }]);
            setAvailableOptions(parsedResponse.available_options || []);
        } catch (error) {
            console.error('Error handling message:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
            setAvailableOptions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const startConversation = async () => {
        setHasStarted(true);
        const initialMessage: ChatMessage = {
            role: 'user',
            content: 'Hello'
        };
        await handleSendMessage({ id: 0, text: 'Hello', type: 'dialogue' });
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

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-4xl font-bold text-zinc-700 text-center mb-6">
                Chat with AI Assistant
            </h1>

            <div className="flex gap-4">
                {/* Location Description Sidebar */}
                <div className="w-1/3">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h2 className="text-lg font-semibold mb-2">Location Description</h2>
                        <textarea
                            value={locationDescription}
                            onChange={(e) => setLocationDescription(e.target.value)}
                            placeholder="Required: Describe the location or context..."
                            className="w-full h-32 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            disabled={hasStarted}
                        />
                        <p className="text-sm text-gray-500 mt-2">
                            Please provide a description of the location or context for the conversation.
                        </p>
                    </div>
                </div>

                {/* Chat Main Area */}
                <div className="w-2/3 bg-white rounded-lg shadow-md h-[600px] flex flex-col">
                    {/* Chat messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg ${
                                    message.role === 'user'
                                        ? 'bg-blue-100 ml-auto'
                                        : 'bg-gray-100'
                                } max-w-[80%] ${
                                    message.role === 'user' ? 'ml-auto' : 'mr-auto'
                                }`}
                            >
                                <p className="text-sm font-semibold mb-1">
                                    {message.role === 'user' ? 'You' : 'Assistant'}
                                </p>
                                <p className="text-gray-800">{message.content}</p>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="text-center text-gray-500">
                                Assistant is typing...
                            </div>
                        )}
                    </div>

                    {/* Options or Start Button */}
                    <div className="px-4 py-4 border-t">
                        {!hasStarted ? (
                            <Button 
                                onClick={startConversation}
                                disabled={!locationDescription.trim() || isLoading}
                                className="w-full"
                            >
                                Start Conversation
                            </Button>
                        ) : (
                            renderOptions()
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withAuth(Chat);