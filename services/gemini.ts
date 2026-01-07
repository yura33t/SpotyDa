
import { Track } from "../types.ts";

// Используем iTunes Search API - бесплатно, без ключей, только реальные данные
const ITUNES_BASE_URL = "https://itunes.apple.com/search";

const formatDuration = (ms: number): string => {
  if (!ms) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const mapItunesTrack = (item: any): Track => ({
  id: String(item.trackId || Math.random()),
  title: item.trackName || "Unknown Title",
  artist: item.artistName || "Unknown Artist",
  album: item.collectionName || "Unknown Album",
  coverUrl: (item.artworkUrl100 || "").replace("100x100bb", "600x600bb"), // Берем обложку в высоком качестве
  audioUrl: item.previewUrl || "", // Реальная ссылка на 30-сек превью
  duration: formatDuration(item.trackTimeMillis || 30000)
});

export const searchMusic = async (query: string): Promise<Track[]> => {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(`${ITUNES_BASE_URL}?term=${encodeURIComponent(query)}&media=music&limit=20`);
    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();
    return (data.results || []).map(mapItunesTrack);
  } catch (e) {
    console.error("iTunes Search failed:", e);
    return [];
  }
};

export const getRecommendations = async (): Promise<Track[]> => {
  // Для рекомендаций просто ищем популярные хиты 2024-2025
  try {
    const response = await fetch(`${ITUNES_BASE_URL}?term=2024+hits&media=music&limit=15&sort=recent`);
    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();
    return (data.results || []).map(mapItunesTrack);
  } catch (e) {
    console.error("iTunes Recommendations failed:", e);
    return [];
  }
};
