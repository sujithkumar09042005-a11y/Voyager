import { useCallback, useState } from 'react';
import { sendChatMessage } from '../lib/gemini';
import type { ChatMessage, Destination } from '../types';

function generateId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useItineraryAssistant(destination?: Destination) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id:        generateId(),
      role:      'assistant',
      content:   destination
        ? `Hello! I'm your travel assistant for **${destination.name}**. Ask me anything — best time to visit, local tips, hidden gems, food recommendations, or help planning your days.`
        : `Hello! I'm your AI travel assistant. Ask me anything about destinations, travel tips, or help planning your trip.`,
      timestamp: new Date(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = {
        id:        generateId(),
        role:      'user',
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const payload = {
          messages: [...messages, userMessage].map((m) => ({
            role:    m.role,
            content: m.content,
          })),
          ...(destination && {
            destinationContext: {
              name:            destination.name,
              country:         destination.country,
              description:     destination.description,
              places:          destination.places.map((p) => p.name),
              bestTimeToVisit: destination.bestTimeToVisit,
              avgDailyBudget:  destination.avgDailyBudget,
            },
          }),
        };

        const response = await sendChatMessage(payload);

        const assistantMessage: ChatMessage = {
          id:        generateId(),
          role:      'assistant',
          content:   response.content,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorText =
          err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.';
        setError(errorText);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, destination],
  );

  const clearError = useCallback(() => setError(null), []);
  const clearChat  = useCallback(() => {
    setMessages([
      {
        id:        generateId(),
        role:      'assistant',
        content:   destination
          ? `Hello! I'm your travel assistant for **${destination.name}**. How can I help?`
          : `Hello! I'm your AI travel assistant. How can I help?`,
        timestamp: new Date(),
      },
    ]);
    setError(null);
  }, [destination]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearError,
    clearChat,
  };
}
