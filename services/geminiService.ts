
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

/**
 * Génère une image en utilisant Gemini 2.5 Flash Image
 */
export const generateStacyImage = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [{ text: prompt }] 
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Extraction de la première image trouvée dans les parties de la réponse
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data returned from model");
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};
