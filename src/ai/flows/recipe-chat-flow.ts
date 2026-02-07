'use server';

import { GoogleGenAI } from '@google/genai';
import { adminDb } from '@/lib/firebase-admin'; 
import { ChatInput } from './chat-types';

const gg = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function chatWithBot(
  input: ChatInput
): Promise<ReadableStream<Uint8Array>> {

  console.log("Starting chatWithBot...");
  // Use Gemini 3 Flash Preview (requested)
  const model = 'gemini-3-flash-preview';
  console.log("Using model:", model);


  const systemPrompt = `You are Kinetic, a professional and concise culinary assistant.

  ###  INTENT CLASSIFICATION - READ FIRST:
  
  **CATEGORY A: GREETINGS & SMALL TALK**
  - Triggers: "Hi", "Hello", "Who are you?", "Good morning", purely gibberish.
  - Action: Respond politely, introduce yourself, and ask what they want to cook.
  - **Format:** Plain text. NO recipe headers.

  **CATEGORY B: RECIPE & COOKING REQUESTS**
  - Triggers: 
    1. Direct: "How to cook [dish]", "Recipe for [dish]", "Make [dish]".
    2. Vague/Cravings: "I want something sweet", "I have chicken and rice", "I have a microwave and a mug".
  - **CRITICAL ACTION:** 1. If the user names a dish, make it.
    2. **If the user is vague (e.g., "something chocolatey"), DO NOT ask "What would you like?".** Instead, INFER the most likely popular dish (e.g., Chocolate Mug Cake) and GENERATE IT IMMEDIATELY.
    3. You **MUST** generate the recipe using the CRITICAL FORMATTING RULES below.

  --------------------------------------------------

  ### CRITICAL RECIPE FORMATTING RULES (For Category B Only):

  1. **HEADER:** Use '# <Recipe Title>' on the very first line.

  2. **METADATA:** On the next line, provide: " Prep: 10m |  Cook: 20m |  Serves: 4"

  3. **INTRO:** One italicized sentence (40–50 words) about origin, history, or flavor.

  4. **SEPARATOR 1:**
     - Insert a blank line.
     - Insert '---'.
     - Insert another blank line.

  5. **INGREDIENTS:**
     - Header: '### Ingredients'
     - List Wrapper: <ol class="ingredients"> ... </ol>
     - Items: Use HTML <li> tags for the item.
     - Example:
       <ol class="ingredients">
         <li>1 Egg — large</li>
         <li>Butter — unsalted</li>
       </ol>
     - **CRITICAL:** Insert a blank line AFTER the closing </ol> tag.

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
   - The line MUST describe something specific about the dish: its flavor 😋 aroma 👃 texture 🤤 richness 🍫 warmth 🍲 spice level 🌶️ freshness 🥗 comfort 🛌 visual appeal 📸 cultural character 🌍
   - Include EXACTLY one emoji related to the dish.
   - DO NOT use generic phrases like:
       “enjoy your meal”, “serve hot”, “hope you like it”.
  `;

  const history = input.history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  try {
    console.log("Creating chat session...");
    const chat = gg.chats.create({
      model,
      config: {
        systemInstruction: systemPrompt,
      },
      history,
    });

    console.log("Sending message stream...");
    const stream = await chat.sendMessageStream({
      message: input.prompt,
    });

    const textStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          // Iterate over the stream chunks
          for await (const chunk of stream) {
            // chunk.text contains the text part of the chunk
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
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
        // Provide a friendly error message to the client
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
  const model = 'gemini-3-flash-preview';
  
  const systemPrompt = `
    You are a naming assistant.
    Generate a concise, 3-5 word title for a chat based on the user's first message.
    - Do not use quotes.
    - Do not use "Recipe for...". 
    - Just the dish name or topic.
    - If input is generic (hi, hello), return "New Conversation".
  `;

  try {
    const response = await gg.models.generateContent({
      model,
      config: {
        systemInstruction: systemPrompt,
      },
      contents: firstMessage,
    });

    const text = response.text;
    const cleanTitle = text ? text.trim().replace(/^["']|["']$/g, '') : "New Conversation";

    await adminDb.collection('users').doc(userId).collection('chats').doc(chatId).update({
      title: cleanTitle
    });

    return cleanTitle;

  } catch (error) {
    console.error("Title generation failed:", error);
    return null;
  }
}