
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface TrackIdea {
  title: string;
  artist: string;
}

const THEMES = ["Phonk Night", "Cyberpunk Techno", "Lofi Dreams", "Deep House 2025", "Russian Indie", "Synthwave", "Modern Hip Hop"];

export const getGroundedRecommendations = async (): Promise<TrackIdea[]> => {
  const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
  
  try {
    const ai = getAI();
    // Минимальный бюджет для мгновенного ответа
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `List 10 songs for: ${theme}. JSON format only: [{"title": "...", "artist": "..."}]`,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING }
            },
            required: ["title", "artist"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};

export const getSmartSearchQuery = async (userPrompt: string): Promise<string> => {
  if (!userPrompt || userPrompt.trim().length < 5) return userPrompt;
  
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Переключаем на Flash для скорости
      contents: `Search term for: "${userPrompt}". Answer ONLY with "Artist - Song".`,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 30,
        temperature: 0.1
      }
    });

    return response.text?.replace(/"/g, '').trim() || userPrompt;
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
  const defaultAnalysis = { focalPoint: { x: 50, y: 50 }, filters: 'brightness(0.6)', themeColor: '#FF5500' };
  try {
    const ai = getAI();
    const base64Data = base64Image.split(',')[1];
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Data } },
          { text: `Analyze wallpaper. Focal point and colors. JSON format.` }
        ]
      }],
      config: {
        thinkingConfig: { thinkingBudget: 0 },
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
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return defaultAnalysis;
  }
};

export const enhanceWallpaper = async (base64Image: string): Promise<string> => {
  try {
    const ai = getAI();
    const base64Data = base64Image.split(',')[1];
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: 'Enhance for OLED display.' },
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