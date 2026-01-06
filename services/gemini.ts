
import { GoogleGenAI, Type } from "@google/genai";
import { Track } from "../types.ts";

export const getGeminiAI = () => {
  // API key is injected by Vite at build time via process.env.API_KEY
  const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || "";
  return new GoogleGenAI({ apiKey });
};

const cache = new Map<string, any>();

export const searchMusic = async (query: string): Promise<Track[]> => {
  const cacheKey = `search_${query.trim().toLowerCase()}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const ai = getGeminiAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
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
    console.error("Search error:", e);
    return [];
  }
};

export const getRecommendations = async (): Promise<Track[]> => {
  const cacheKey = 'recs_v1';
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const ai = getGeminiAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Trending music tracks. Return JSON array of tracks with properties: id, title, artist, album, coverUrl, duration, audioUrl.`,
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
    console.error("Recommendations error:", e);
    return [];
  }
};
