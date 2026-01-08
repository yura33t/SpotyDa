import { GoogleGenAI, Type } from "@google/genai";

export const getSmartSearchQuery = async (userPrompt: string): Promise<string> => {
  if (!userPrompt || userPrompt.trim().length < 3) return userPrompt;
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing, using raw query.");
    return userPrompt;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{
          text: `User is searching for music: "${userPrompt}". 
          Convert this to a short, keyword-based search query (artists, song names, or genres). 
          Output ONLY the keywords.`
        }]
      }],
    });
    
    const resultText = response.text;
    return resultText?.trim() || userPrompt;
  } catch (error) {
    console.warn("Gemini query enhancement failed:", error);
    return userPrompt;
  }
};

export interface WallpaperAnalysis {
  focalPoint: { x: number; y: number };
  filters: string;
  themeColor: string;
}

export const analyzeWallpaper = async (base64Image: string): Promise<WallpaperAnalysis> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return { focalPoint: { x: 50, y: 50 }, filters: 'brightness(0.5)', themeColor: '#1DB954' };

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = base64Image.split(',')[1];

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
              }
            },
            {
              text: `Analyze this image for a music app background. 
              1. Detect the main subject or the most visually interesting part. 
              2. Return the focal point (x and y as percentage 0-100) so I can set background-position. 
              3. Suggest CSS filters to ensure white text is readable (e.g. "brightness(0.4) contrast(1.1)"). IMPORTANT: Do NOT include any blur filters.
              4. Pick a dominant vibrant color from the image.
              Return ONLY a JSON object with keys: focalPoint (object with x,y), filters (string), themeColor (hex string).`
            }
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
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
              },
              required: ["x", "y"]
            },
            filters: { type: Type.STRING },
            themeColor: { type: Type.STRING }
          },
          required: ["focalPoint", "filters", "themeColor"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text) as WallpaperAnalysis;
  } catch (error) {
    console.error("AI Wallpaper analysis failed:", error);
    return { focalPoint: { x: 50, y: 50 }, filters: 'brightness(0.5)', themeColor: '#1DB954' };
  }
};

/**
 * Использование Gemini 2.5 Flash Image для "апскейла" (улучшения качества) фона.
 */
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
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          },
          {
            text: 'Enhance this image for a desktop wallpaper. Increase clarity, details, and sharpness while preserving the original composition, colors, and mood. Make it look like a high-resolution professional photograph or digital art. Do not add any new elements.',
          },
        ],
      },
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }
    }
    return base64Image;
  } catch (error) {
    console.error("AI Wallpaper enhancement failed:", error);
    return base64Image;
  }
};