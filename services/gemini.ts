
import { GoogleGenAI, Type } from "@google/genai";
import { Track } from "../types.ts";

// Прямой доступ к ключу согласно правилам
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const cache = new Map<string, any>();

export const searchMusic = async (query: string): Promise<Track[]> => {
  const cacheKey = `search_${query.trim().toLowerCase()}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for real music tracks matching: "${query}". 
      Return exactly 10 tracks as a JSON array. 
      Important: audioUrl should be a direct link to a high-quality preview or a valid stream. 
      Use https://picsum.photos/seed/{id}/500/500 for coverUrl.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              album: { type: Type.STRING },
              coverUrl: { type: Type.STRING },
              duration: { type: Type.STRING },
              audioUrl: { type: Type.STRING },
            },
            required: ["id", "title", "artist", "album", "coverUrl", "duration", "audioUrl"],
          },
        },
      },
    });

    const data = JSON.parse(response.text || "[]");
    cache.set(cacheKey, data);
    return data;
  } catch (e) {
    console.error("Search failed:", e);
    return [];
  }
};

export const getRecommendations = async (): Promise<Track[]> => {
  const cacheKey = 'recs_v2';
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a list of 12 trending global hits. Return as JSON array with id, title, artist, album, coverUrl (picsum), duration, and audioUrl.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              album: { type: Type.STRING },
              coverUrl: { type: Type.STRING },
              duration: { type: Type.STRING },
              audioUrl: { type: Type.STRING },
            },
            required: ["id", "title", "artist", "album", "coverUrl", "duration", "audioUrl"],
          },
        },
      },
    });

    const data = JSON.parse(response.text || "[]");
    cache.set(cacheKey, data);
    return data;
  } catch (e) {
    console.error("Recommendations failed:", e);
    return [];
  }
};
