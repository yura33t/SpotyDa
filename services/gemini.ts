
import { GoogleGenAI, Type } from "@google/genai";
import { Track } from "../types";

export const getGeminiAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const cache = new Map<string, any>();

/**
 * Оптимизированный поиск: быстрый промпт и строгая схема.
 */
export const searchMusic = async (query: string): Promise<Track[]> => {
  const cacheKey = `search_${query.trim().toLowerCase()}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const ai = getGeminiAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Find 8 music tracks for "${query}". Output JSON array: {id, title, artist, album, coverUrl, duration, audioUrl}. Use https://picsum.photos/seed/{id}/300/300 for coverUrl.`,
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

  try {
    const text = response.text;
    const data = text ? JSON.parse(text) : [];
    cache.set(cacheKey, data);
    return data;
  } catch (e) {
    console.error("Search failed", e);
    return [];
  }
};

/**
 * Рекомендации с гарантированными фото.
 */
export const getRecommendations = async (): Promise<Track[]> => {
  const cacheKey = 'recommendations_v2';
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const ai = getGeminiAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Trending 12 tracks. JSON array: {id, title, artist, album, coverUrl, duration, audioUrl}. Use https://picsum.photos/seed/{id}/400/400 for coverUrl.`,
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

  try {
    const text = response.text;
    const data = text ? JSON.parse(text) : [];
    cache.set(cacheKey, data);
    return data;
  } catch (e) {
    console.error("Recommendations failed", e);
    return [];
  }
};
