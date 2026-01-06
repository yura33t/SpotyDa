
import { GoogleGenAI, Type } from "@google/genai";
import { Track } from "../types.ts";

export const getGeminiAI = () => {
  const apiKey = process.env.API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

const cache = new Map<string, any>();

/**
 * Быстрый поиск музыки с использованием кэширования и оптимизированного промпта.
 */
export const searchMusic = async (query: string): Promise<Track[]> => {
  const cacheKey = `search_${query.trim().toLowerCase()}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const ai = getGeminiAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Act as a music API. Find 8 real tracks for "${query}". Return ONLY a JSON array of objects: {id, title, artist, album, coverUrl, duration, audioUrl}. For coverUrl always use https://picsum.photos/seed/{id}/400/400.`,
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

/**
 * Рекомендации с гарантированными фото и высокой скоростью ответа.
 */
export const getRecommendations = async (): Promise<Track[]> => {
  const cacheKey = 'recommendations_daily_v3';
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const ai = getGeminiAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Trending global tracks. Return JSON array: {id, title, artist, album, coverUrl, duration, audioUrl}. Use https://picsum.photos/seed/{id}/400/400 for coverUrl.`,
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
