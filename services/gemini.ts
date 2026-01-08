
import { GoogleGenAI, Type } from "@google/genai";

export const getSmartSearchQuery = async (userPrompt: string): Promise<string> => {
  if (!userPrompt || userPrompt.trim().length < 2) return userPrompt;
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) return userPrompt;

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Добавляем искусственный таймаут на 2 секунды для AI
    const aiPromise = ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{
          text: `Music search: "${userPrompt}". Keywords only (artist, track).`
        }]
      }],
    });

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
    const response: any = await Promise.race([aiPromise, timeoutPromise]);

    if (!response) return userPrompt;
    
    const resultText = response.text;
    return resultText?.trim() || userPrompt;
  } catch (error) {
    return userPrompt;
  }
};

export interface WallpaperAnalysis {
  focalPoint: { x: number; y: number };
  filters: string;
  themeColor: string;
}

export const analyzeWallpaper = async (base64Image: string): Promise<WallpaperAnalysis> => {
  const defaultAnalysis = { focalPoint: { x: 50, y: 50 }, filters: 'brightness(0.5)', themeColor: '#1DB954' };
  const apiKey = process.env.API_KEY;
  if (!apiKey) return defaultAnalysis;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = base64Image.split(',')[1];

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Data } },
            { text: `JSON: {focalPoint: {x,y}, filters: string, themeColor: hex}. Focus on subject, no blur filters.` }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            focalPoint: {
              type: Type.OBJECT,
              properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
              required: ["x", "y"]
            },
            filters: { type: Type.STRING },
            themeColor: { type: Type.STRING }
          },
          required: ["focalPoint", "filters", "themeColor"]
        }
      }
    });

    return JSON.parse(response.text) as WallpaperAnalysis;
  } catch (error) {
    return defaultAnalysis;
  }
};

export const enhanceWallpaper = async (base64Image: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return base64Image;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = base64Image.split(',')[1];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: 'Enhance clarity and details for wallpaper. No new elements.' },
        ],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/jpeg;base64,${part.inlineData.data}`;
      }
    }
    return base64Image;
  } catch (error) {
    return base64Image;
  }
};
