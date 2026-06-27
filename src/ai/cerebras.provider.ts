import { Cerebras } from '@cerebras/cerebras_cloud_sdk';
import { AIProvider, AIChatResponse } from './ai.provider';
import { config } from '../config';
import { logger } from '../utils/logger';

export class CerebrasProvider implements AIProvider {
  private client: Cerebras;

  constructor() {
    this.client = new Cerebras({
      apiKey: config.cerebrasApiKey,
    });
  }

  async processChat(
    userMessage: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt: string
  ): Promise<AIChatResponse> {
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: 'user', content: userMessage },
      ];

      logger.debug(`Sending chat request to Cerebras using model ${config.cerebrasModel}`);
      const completion = (await this.client.chat.completions.create({
        model: config.cerebrasModel,
        messages: messages as any,
        response_format: { type: 'json_object' },
        temperature: 0.3,
      })) as any;

      const rawContent = completion.choices[0]?.message?.content || '';
      logger.debug(`Received raw response from Cerebras: ${rawContent}`);

      if (!rawContent) {
        throw new Error('Empty response received from Cerebras API');
      }

      const parsed: AIChatResponse = JSON.parse(rawContent);

      // Validate parsed JSON output structure
      if (!parsed.response) {
        throw new Error('Parsed response is missing the "response" property');
      }

      return {
        response: parsed.response,
        purchaseIntent: !!parsed.purchaseIntent,
        leadDetails: parsed.leadDetails || undefined,
        bookingIntent: !!parsed.bookingIntent,
        bookingDetails: parsed.bookingDetails || undefined,
      };
    } catch (error: any) {
      logger.error(`Error in CerebrasProvider: ${error.message}`);
      
      // Fallback response format if JSON parsing failed
      return {
        response: "I'm sorry, I encountered an error processing that request. Let me get back to you.",
        purchaseIntent: false,
      };
    }
  }
}
