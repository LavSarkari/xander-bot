import 'dotenv/config';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.NAVYAI_API_KEY,
  baseURL: "https://api.navy/v1",
});

console.log('Using OpenAI API Key:', process.env.OPENAI_API_KEY || process.env.NAVYAI_API_KEY);

export async function translate(text) {
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Translate the following input to English. Respond only with the translated sentence, nothing else."
      },
      {
        role: "user",
        content: text
      }
    ],
  });
  return chatCompletion.choices[0].message.content.trim();
}

export async function explain(text) {
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: `Explain this in simple terms: ${text}`
      }
    ],
  });
  return chatCompletion.choices[0].message.content.trim();
}

export async function analyze(text) {
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Analyze the input. Output:\n1. Detected language\n2. Emotion or tone\n3. Summary"
      },
      {
        role: "user",
        content: text
      }
    ],
  });
  return chatCompletion.choices[0].message.content;
}

export async function replyTo(message, style = "casual") {
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: `Reply to this in a ${style} tone: ${message}`
      }
    ],
  });
  return chatCompletion.choices[0].message.content.trim();
}

export async function emojify(text) {
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: `Convert this sentence to expressive emoji-filled Discord-style speech: ${text}`
      }
    ],
  });
  return chatCompletion.choices[0].message.content.trim();
}

export async function aiRoast(text) {
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: `Roast this person like a savage Discord user would. Make it mean but funny. Their name or description is: ${text}`
      }
    ],
  });
  return chatCompletion.choices[0].message.content.trim();
}

export async function imagine(prompt) {
  const response = await openai.images.generate({
    model: "flux.1-schnell",
    prompt: prompt,
    size: "1024x1024",
    n: 1,
  });
  return response.data[0].url;
} 