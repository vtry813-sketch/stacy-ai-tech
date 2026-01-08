
import { GoogleGenAI } from "@google/genai";

export const generateStacyResponse = async (
  prompt: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  systemInstruction: string,
  temperature: number = 0.7
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction,
        temperature,
        topP: 0.8,
        topK: 40,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const streamStacyResponse = async (
  prompt: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  systemInstruction: string,
  onChunk: (text: string) => void,
  temperature: number = 0.7
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction,
        temperature,
      }
    });

    const result = await chat.sendMessageStream({ message: prompt });
    
    let fullText = "";
    for await (const chunk of result) {
      const text = chunk.text || "";
      fullText += text;
      onChunk(text);
    }
    return fullText;
  } catch (error) {
    console.error("Streaming Error:", error);
    throw error;
  }
};
