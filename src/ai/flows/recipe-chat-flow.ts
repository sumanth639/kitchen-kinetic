'use server';

import { ai } from '@/ai/genkit';
import { ChatInput } from './chat-types';

export async function chatWithBot(
  input: ChatInput
): Promise<ReadableStream<Uint8Array>> {

  const model = 'googleai/gemini-2.5-flash-lite';

  const systemPrompt = `You are Kinetic, a professional and concise culinary assistant.

  ### PROTOCOL - READ FIRST:
  1. **GREETINGS & GENERAL CHAT:**
     - If the user says "hi", "hello", sends gibberish, or asks a general question (e.g. "how are you?"), respond politely and briefly. 
     - Introduce yourself as Kinetic and ask what they would like to cook.
     - **DO NOT** generate a recipe.

  2. **RECIPE REQUESTS:**
     - ONLY if the user explicitly asks for a dish or recipe, you **MUST** follow the formatting rules below exactly.

  --------------------------------------------------

  ### CRITICAL RECIPE FORMATTING RULES (Apply ONLY for Recipe Requests):

  1. HEADER: Use '# <Recipe Title>' for the main title.

  2. METADATA: Immediately below the title, provide:
     " Prep: 10m |  Cook: 20m |  Serves: 4"

  3. INTRO (Fun Fact):
     - Provide ONE italicized sentence (25–35 words).
     - Must include at least TWO of: Origin, Culture, History, Nutrition, or Popularity.
     

  4. SEPARATOR:
     Insert '---' after the intro.

  5. INGREDIENTS:
     - Add '### Ingredients'
     - The ingredients list MUST be wrapped inside:
         <ul class="ingredients"> ... </ul>
     - INSIDE the ingredients list, you MUST use REAL HTML <li> tags, not markdown bullets.
       Example:
         <ul class="ingredients">
           <li><strong>500g Chicken</strong> — sliced</li>
           <li><strong>30ml Oil</strong> — coconut oil recommended</li>
         </ul>
     - Always bold the quantity + ingredient using <strong>.
     - Use a short descriptive note after "—".

  6. SEPARATOR:
     Insert '---' after ingredients.

  7. INSTRUCTIONS:
     - Add '### Instructions'
     - DO NOT use '*' or '-' for bullets.
     - Each step must be formatted as a standalone paragraph:
         **Step 1:** Do this...
         **Step 2:** Do that...
     - Each step must have a blank line after it.

  8. CONCLUSION:
     - After the final instruction, add ONE short closing line.
     - It MUST be directly related to the specific dish.
     - Length: 8–14 words.
     - Include exactly ONE emoji.
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