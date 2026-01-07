
import { Track } from "../types.ts";

/**
 * Audius API - Децентрализованный музыкальный сервис.
 * Позволяет стримить ПОЛНЫЕ треки без ограничений (в отличие от iTunes/SoundCloud).
 */

let discoveryNode: string = "https://discoveryprovider.audius.co";

// Динамический поиск живого узла для максимальной скорости
const findHealthyNode = async () => {
  try {
    const response = await fetch("https://api.audius.co");
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      discoveryNode = data.data[0];
    }
  } catch (e) {
    console.error("Failed to find Audius node, using default", e);
  }
};

// Запускаем поиск узла сразу
findHealthyNode();

export const searchMusic = async (query: string): Promise<Track[]> => {
  if (!query.trim()) return [];
  
  try {
    const url = `${discoveryNode}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=SPOTYDA_APP`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Audius search failed");
    
    const { data } = await response.json();
    
    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      artist: item.user?.name || "Unknown Artist",
      album: item.genre || "Audius Track",
      coverUrl: item.artwork?.["480x480"] || item.artwork?.["150x150"] || `https://api.dicebear.com/7.x/initials/svg?seed=${item.title}`,
      // Прямая ссылка на ПОЛНЫЙ аудиопоток
      audioUrl: `${discoveryNode}/v1/tracks/${item.id}/stream?app_name=SPOTYDA_APP`,
      duration: formatSeconds(item.duration || 0)
    }));
  } catch (e) {
    console.error("Audius Search error:", e);
    return [];
  }
};

export const getRecommendations = async (): Promise<Track[]> => {
  try {
    // Получаем трендовые треки недели
    const url = `${discoveryNode}/v1/tracks/trending?app_name=SPOTYDA_APP`;
    const response = await fetch(url);
    const { data } = await response.json();

    return (data || []).slice(0, 20).map((item: any) => ({
      id: item.id,
      title: item.title,
      artist: item.user?.name,
      album: item.genre || "Trending",
      coverUrl: item.artwork?.["480x480"] || item.artwork?.["150x150"],
      audioUrl: `${discoveryNode}/v1/tracks/${item.id}/stream?app_name=SPOTYDA_APP`,
      duration: formatSeconds(item.duration || 0)
    }));
  } catch (e) {
    console.error("Audius Trending error:", e);
    return [];
  }
};

const formatSeconds = (totalSeconds: number): string => {
  if (!totalSeconds) return "0:00";
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
