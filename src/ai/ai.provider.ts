export interface AIChatResponse {
  response: string;
  purchaseIntent: boolean;
  leadDetails?: {
    name?: string;
    business?: string;
    phone?: string;
    email?: string;
    requirements?: string;
  };
  bookingIntent?: boolean;
  bookingDetails?: {
    date?: string;
    time?: string;
    confirmed?: boolean;
  };
}

export interface AIProvider {
  processChat(
    userMessage: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt: string
  ): Promise<AIChatResponse>;
}
