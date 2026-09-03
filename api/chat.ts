import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

const SYSTEM_PROMPT = `You are Voyager AI, an expert travel assistant with deep knowledge of world destinations, local cultures, food, logistics, and practical travel tips.
Guidelines:
- Whenever quoting prices, budgets, meal costs, or ticket estimates, ALWAYS state amounts in Indian Rupees (₹ INR).
- Be comprehensive and thorough, formatting responses with clean markdown (bold, bullet points) for readability.
- Mention specific places, authentic dishes, or local experiences when relevant.
- Never truncate or cut off your response mid-thought.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  try {
    const { messages, destinationContext } = req.body;

    if (!messages?.length) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    // Build system context
    let contextPrompt = SYSTEM_PROMPT;
    if (destinationContext) {
      contextPrompt += `\n\nCurrent destination context:
- Name: ${destinationContext.name}, ${destinationContext.country}
- Description: ${destinationContext.description}
- Key places: ${destinationContext.places.join(', ')}
- Best time to visit: ${destinationContext.bestTimeToVisit}
- Average daily budget: ${destinationContext.avgDailyBudget}

Tailor your responses to this destination when relevant.`;
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: contextPrompt,
    });

    // Build chat history (must start with user role for Gemini API)
    const historyMessages = messages.slice(0, -1);
    const firstUserIndex = historyMessages.findIndex((m: { role: string }) => m.role === 'user');
    const validHistory = firstUserIndex !== -1 ? historyMessages.slice(firstUserIndex) : [];

    const history = validHistory.map((m: { role: string; content: string }) => ({
      role:  m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 8192,
        temperature:     0.7,
      },
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const responseText = result.response.text();

    return res.status(200).json({ content: responseText });
  } catch (err) {
    console.error('[/api/chat] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to generate response';
    return res.status(500).json({ error: message });
  }
}
