'use server';

import { ai } from '@/ai/genkit';
import { adminDb } from '@/lib/firebase-admin'; 
import { ChatInput } from './chat-types';

/**
 * Main Chat Function - Handles streaming responses
 */
export async function chatWithBot(
  input: ChatInput
): Promise<ReadableStream<Uint8Array>> {

  const model = 'googleai/gemini-2.5-flash-lite';

  const systemPrompt = `You are Kinetic, a professional and concise culinary assistant.

  ### 🚨 INTENT CLASSIFICATION - READ FIRST:
  
  **CATEGORY A: GREETINGS & SMALL TALK**
  - Triggers: "Hi", "Hello", "Who are you?", "Good morning", gibberish.
  - Action: Respond politely, introduce yourself, and ask what they want to cook.
  - **Format:** Plain text. NO recipe headers.

  **CATEGORY B: RECIPE & COOKING REQUESTS**
  - Triggers: "How to cook [dish]", "Recipe for [dish]", "Make [dish]", "I want [dish]", "Ingredients for [dish]".
  - Action: You **MUST** generate the recipe using the CRITICAL FORMATTING RULES below.

  --------------------------------------------------

  ### 📝 CRITICAL RECIPE FORMATTING RULES (For Category B Only):

  1. **HEADER:** Use '# <Recipe Title>' on the very first line.

  2. **METADATA:** On the next line, provide: " Prep: 10m |  Cook: 20m |  Serves: 4"

  3. **INTRO:** One italicized sentence (25–35 words) about origin, history, or flavor.

  4. **SEPARATOR 1:**
     - Insert a blank line.
     - Insert '---'.
     - Insert another blank line.

  5. **INGREDIENTS:**
     - Header: '### Ingredients'
     - List Wrapper: <ul class="ingredients"> ... </ul>
     - Items: Use HTML <li> tags  for the item.
     - Example:
       <ul class="ingredients">
         <li>1 Egg — large</li>
         <li>5g Butter — unsalted</li>
       </ul>
     - **CRITICAL:** Insert a blank line AFTER the closing </ul> tag.

  6. **SEPARATOR 2:**
     - Insert a blank line.
     - Insert '---'.
     - Insert another blank line.

  7. **INSTRUCTIONS:**
     - Header: '### Instructions'
     - **CRITICAL:** You MUST insert a blank line AFTER this header.
     - Format:
       **Step 1:** Heat the pan...
       [BLANK LINE]
       **Step 2:** Crack the egg...
       [BLANK LINE]
     - DO NOT use bullet points (* or -). Use "**Step X:**".

  8. CONCLUSION:
   - End the recipe with ONE short, expressive line (8–14 words).
   - The line MUST describe something specific about the dish: its flavor aroma texture richness  warmth  spice level  freshness  comfort visual appeal  cultural character
   - Include EXACTLY one emoji related to the dish.
   - DO NOT use generic phrases like:
       “enjoy your meal”, “serve hot”, “hope you like it”.
  `;

  const history = input.history.map((msg) => ({
    role: msg.role,
    content: [{ text: msg.content }],
  }));

  history.push({ role: 'user', content: [{ text: input.prompt }] });

  try {
    const { stream } = await ai.generateStream({
      model,
      system: systemPrompt,
      messages: history,
    });

    const textStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
          }
          controller.close();
        } catch (e) {
          console.error("Streaming error:", e);
          controller.error(e);
        }
      }
    });
    
    return textStream;

  } catch (error) {
    console.error("Generation error:", error);
    const encoder = new TextEncoder();
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode("I'm having trouble connecting to the kitchen. Please try again in a moment!"));
        controller.close();
      }
    });
  }
}

/**
 * Auto-Title Generator
 */
export async function generateChatTitle(userId: string, chatId: string, firstMessage: string) {
  const model = 'googleai/gemini-2.5-flash-lite';
  
  const systemPrompt = `
    You are a naming assistant.
    Generate a concise, 3-5 word title for a chat based on the user's first message.
    - Do not use quotes.
    - Do not use "Recipe for...". 
    - Just the dish name or topic.
    - If input is generic (hi, hello), return "New Conversation".
  `;

  try {
    const { text } = await ai.generate({
      model,
      system: systemPrompt,
      prompt: firstMessage,
    });

    const cleanTitle = text.trim().replace(/^["']|["']$/g, '');

    await adminDb.collection('users').doc(userId).collection('chats').doc(chatId).update({
      title: cleanTitle
    });

    return cleanTitle;

  } catch (error) {
    console.error("Title generation failed:", error);
    return null;
  }
}