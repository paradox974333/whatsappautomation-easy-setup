import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

/**
 * The business persona is loaded from an editable markdown file so that anyone
 * forking this project can rebrand the assistant without touching code.
 *
 * Edit `prompt/persona.md` (or set PERSONA_FILE to a custom path) to describe
 * YOUR business: name, services, pricing approach, tone, and target audience.
 *
 * The machine-critical lead-extraction rules and JSON output contract below are
 * intentionally kept in code so a customized persona can never break parsing.
 */
export class PromptManager {
  private static cachedPersona: string | null = null;

  private static get personaPath(): string {
    return process.env.PERSONA_FILE || path.join(process.cwd(), 'prompt', 'persona.md');
  }

  private static loadPersona(): string {
    if (this.cachedPersona !== null) {
      return this.cachedPersona;
    }

    try {
      const raw = fs.readFileSync(this.personaPath, 'utf-8');
      // Strip HTML comments (editing instructions) so they aren't sent to the model.
      this.cachedPersona = raw.replace(/<!--[\s\S]*?-->/g, '').trim();
    } catch (err) {
      logger.warn(
        `Could not read persona file at ${this.personaPath}. Falling back to a generic default. ` +
          `Create prompt/persona.md to customize the assistant for your business.`
      );
      this.cachedPersona = PromptManager.DEFAULT_PERSONA;
    }

    return this.cachedPersona;
  }

  private static readonly DEFAULT_PERSONA = `You are a knowledgeable, friendly, and professional sales and support assistant for a business.
Answer customer questions naturally and concisely. WhatsApp is a chat medium, so keep replies brief (2-4 sentences) and warm.
Do not invent services, client names, or fixed pricing. If unsure, tell the customer a team member will follow up.`;

  private static readonly EXTRACTION_RULES = `### Rules for Lead Extraction, Booking Intent & Negotiation
1. **Purchase Intent**: You must analyze the user message and history for "purchase intent" (e.g., asking to build a website, pricing questions, running ads, wanting social media management, wanting a meeting).
   - If the customer shows purchase intent, set "purchaseIntent" to true.
   - Extract lead details from the history and messages: name, business, phone, email, requirements.
2. **Booking Intent (Meetings)**:
   - If the user wants to book a meeting/call, you must naturally negotiate a specific date and time (e.g., "Would tomorrow at 3 PM work for you?").
   - Set "bookingIntent" to true if they are discussing scheduling, coordinating times, or confirming a slot.
   - Extract "bookingDetails":
     - **date**: The date of the meeting (e.g., "2026-06-28", "tomorrow", or "Monday").
     - **time**: The time of the meeting (e.g., "11:00 AM" or "3:00 PM").
     - **confirmed**: Set this to **true** ONLY when the customer has explicitly agreed to and confirmed a specific date and time slot. Set to **false** if you are still suggesting times or if the date/time is not yet settled.
3. **Conversational guidelines**:
   - Keep answers natural, warm, and brief (2-4 sentences max). Avoid interrogation. Ask for missing email/details naturally.`;

  private static readonly RESPONSE_FORMAT = `### Response Format
You MUST respond with a JSON object containing EXACTLY these keys:
{
  "response": "Your friendly text message response to the user.",
  "purchaseIntent": true/false,
  "leadDetails": {
    "name": "extracted name or null",
    "business": "extracted business name or null",
    "phone": "extracted phone or null",
    "email": "extracted email or null",
    "requirements": "extracted requirements or null"
  },
  "bookingIntent": true/false,
  "bookingDetails": {
    "date": "extracted date or null",
    "time": "extracted time or null",
    "confirmed": true/false
  }
}
Ensure the JSON is valid and output nothing else.`;

  public static getSystemPrompt(): string {
    return `${this.loadPersona()}

${PromptManager.EXTRACTION_RULES}

${PromptManager.RESPONSE_FORMAT}`;
  }
}
