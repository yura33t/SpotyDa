
import { Track } from "../types.ts";

// Максимально широкий список узлов для обхода региональных ограничений
const AUDIUS_NODES = [
  "https://discoveryprovider.audius.co",
  "https://audius-discovery-1.cultur3.bet",
  "https://discovery-us-01.audius.openplayer.org",
  "https://audius-metadata-5.figment.io",
  "https://discovery-au-01.audius.openplayer.org",
  "https://audius-discovery-1.thenode.io",
  "https://discoveryprovider.mumbaiaudius.com",
  "https://audius-discovery-2.thenode.io",
  "https://discoveryprovider.audius.club",
  "https://discovery-eu-01.audius.openplayer.org",
  "https://audius-discovery-3.thenode.io",
  "https://audius-metadata-1.figment.io",
  "https://discovery-us-02.audius.openplayer.org"
];

let currentDiscoveryNode: string | null = localStorage.getItem('spotyda_last_node');
let isNodeReady = false;

const ensureHttps = (url: string) => url?.replace(/^http:/, 'https:');

// Быстрый пинг узла (макс 800мс для максимальной отзывчивости)
const pingNode = async (node: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 800);
    const res = await fetch(`${node}/v1/health_check`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch (e) {
    return false;
  }
};

const findBestNode = async (): Promise<string> => {
  // 1. Пробуем последний удачный узел
  if (currentDiscoveryNode) {
    const isOk = await pingNode(currentDiscoveryNode);
    if (isOk) {
      isNodeReady = true;
      return currentDiscoveryNode;
    }
  }

  // 2. Ищем новый узел среди всех доступных параллельно
  try {
    const winner = await (Promise as any).any(AUDIUS_NODES.map(async (node) => {
      const ok = await pingNode(node);
      if (ok) return node;
      throw new Error("Node slow or down");
    }));
    
    currentDiscoveryNode = winner;
    localStorage.setItem('spotyda_last_node', winner);
    isNodeReady = true;
    return winner;
  } catch (e) {
    // Крайний случай - возвращаем первый из списка
    return AUDIUS_NODES[0];
  }
};

export const searchMusic = async (query: string): Promise<Track[]> => {
  if (!query.trim()) return [];
  
  try {
    const node = await findBestNode();
    const res = await fetch(`${node}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=SPOTYDA_FAST_PRO`);
    const { data } = await res.json();
    
    if (!data) return [];

    return data.map((item: any) => ({
      id: String(item.id),
      title: item.title,
      artist: item.user?.name || "Unknown",
      album: item.genre || "Audius Music",
      coverUrl: ensureHttps(item.artwork?.["480x480"] || item.artwork?.["150x150"] || `https://api.dicebear.com/7.x/initials/svg?seed=${item.title}`),
      audioUrl: ensureHttps(`${node}/v1/tracks/${item.id}/stream?app_name=SPOTYDA_FAST_PRO`),
      duration: `${Math.floor(item.duration / 60)}:${Math.floor(item.duration % 60).toString().padStart(2, '0')}`
    }));
  } catch (e) {
    console.error("Search failed:", e);
    return [];
  }
};

export const getRecommendations = async (): Promise<Track[]> => {
  try {
    const node = await findBestNode();
    const res = await fetch(`${node}/v1/tracks/trending?app_name=SPOTYDA_FAST_PRO`);
    const { data } = await res.json();

    if (!data) return [];

    return data.slice(0, 40).map((item: any) => ({
      id: String(item.id),
      title: item.title,
      artist: item.user?.name || "Unknown",
      album: item.genre || "Trending",
      coverUrl: ensureHttps(item.artwork?.["480x480"] || item.artwork?.["150x150"] || `https://api.dicebear.com/7.x/initials/svg?seed=${item.title}`),
      audioUrl: ensureHttps(`${node}/v1/tracks/${item.id}/stream?app_name=SPOTYDA_FAST_PRO`),
      duration: `${Math.floor(item.duration / 60)}:${Math.floor(item.duration % 60).toString().padStart(2, '0')}`
    }));
  } catch (e) {
    console.error("Recommendations failed:", e);
    return [];
  }
};
