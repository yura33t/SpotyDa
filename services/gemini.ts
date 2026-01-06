
import { GoogleGenAI, Type } from "@google/genai";
import { Track } from "../types.ts";

export const getGeminiAI = () => {
  const apiKey = (window as any).process?.env?.API_KEY || "";
  if (!apiKey) {
    console.warn("API_KEY is missing. AI features will not work.");
  }
  return new GoogleGenAI({ apiKey });
};

const cache = new Map<string, any>();

export const searchMusic = async (query: string): Promise<Track[]> => {
  const cacheKey = `search_${query.trim().toLowerCase()}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const ai = getGeminiAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Act as a music API. Find 8 real tracks for "${query}". Return ONLY a JSON array of objects: {id, title, artist, album, coverUrl, duration, audioUrl}. Use https://picsum.photos/seed/{id}/400/400 for coverUrl.`,
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

    const text = response.text;
    const data = text ? JSON.parse(text) : [];
    cache.set(cacheKey, data);
    return data;
  } catch (e) {
    console.error("Search failed", e);
    return [];
  }
};

export const getRecommendations = async (): Promise<Track[]> => {
  const cacheKey = 'recommendations_daily_v4';
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const ai = getGeminiAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Trending global hits. Return JSON array: {id, title, artist, album, coverUrl, duration, audioUrl}. Use https://picsum.photos/seed/{id}/400/400 for coverUrl.`,
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

    const text = response.text;
    const data = text ? JSON.parse(text) : [];
    cache.set(cacheKey, data);
    return data;
  } catch (e) {
    console.error("Recs failed", e);
    return [];
  }
};
