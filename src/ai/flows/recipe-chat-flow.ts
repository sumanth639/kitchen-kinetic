'use server';

import { ai } from '@/ai/genkit';
import { ChatInput } from './chat-types';

export async function chatWithBot(
  input: ChatInput
): Promise<ReadableStream<Uint8Array>> {

  const model = 'googleai/gemini-2.5-flash-lite';

  const systemPrompt = `You are Kinetic, a professional and concise culinary assistant.

CRITICAL FORMATTING RULES:

1. HEADER: Use '# <Recipe Title>' for the main title.

2. METADATA: Immediately below the title, provide:
   " Prep: 10m |  Cook: 20m |  Serves: 4"

3. INTRO (Fun Fact):
   - Provide ONE italicized sentence (25–35 words).
   - Must include at least TWO of:
     • Origin
     • Culture
     • History
     • Nutrition benefit
     • Regional popularity

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
   - Add '### Instructions and each step should have detialed information'
   - Use a bulleted list ('*')
   - Each bullet MUST start with:
     **Step 1:**, **Step 2:**, etc.

8. NO EXTRA TEXT. No conclusions.

EXAMPLE OUTPUT:

# Chicken Sukka
 Prep: 10m |  Cook: 15m |  Serves: 2

*Originating in coastal Karnataka, this dish is loved for its roasted coconut-spice base and is often served during community harvest feasts to celebrate Mangalorean culinary heritage.*

---

### Ingredients
<ul class="ingredients">
- **500g Chicken** — sliced
- **30ml Oil** — coconut oil recommended
- **2 Onions** — finely chopped
</ul>

---

### Instructions
* **Step 1:** Heat oil in a pan.
* **Step 2:** Add onions and fry.
* **Step 3:** Add chicken and cook.

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
