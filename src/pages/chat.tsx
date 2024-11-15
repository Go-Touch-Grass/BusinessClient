import React, { useState } from 'react';
import { Button } from "@/components/Register/ui/button";
import withAuth from "./withAuth";
import { ChatMessage, createChatCompletion, createStreamingChatCompletion } from '@/api/chatApi';

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: inputMessage
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Using streaming for a better user experience
            let fullResponse = '';
            await createStreamingChatCompletion(
                [...messages, userMessage],
                (data) => {
                    fullResponse += data.message || data.content || '';
                    setMessages(prev => {
                        const newMessages = [...prev];
                        // Update or add the assistant's message
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage && lastMessage.role === 'assistant') {
                            lastMessage.content = fullResponse;
                            return [...newMessages];
                        } else {
                            return [...newMessages, { role: 'assistant', content: fullResponse }];
                        }
                    });
                }
            );
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <h1 className="text-4xl font-bold text-zinc-700 text-center mb-6">
                Chat with AI Assistant
            </h1>

            <div className="bg-white rounded-lg shadow-md h-[600px] flex flex-col">
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

                {/* Input area */}
                <div className="border-t p-4 flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSendMessage();
                        }}
                        placeholder="Type your message..."
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <Button 
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputMessage.trim()}
                    >
                        Send
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default withAuth(Chat);