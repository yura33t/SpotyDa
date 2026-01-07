
import { Track } from "../types.ts";

/**
 * Audius API - Decentralized music service.
 * Optimized for maximum compatibility and performance across all devices.
 */

const FALLBACK_NODES = [
  "https://discoveryprovider.audius.co",
  "https://audius-discovery-1.cultur3.bet",
  "https://discovery-us-01.audius.openplayer.org",
  "https://audius-metadata-5.figment.io",
  "https://discovery-au-01.audius.openplayer.org"
];

let discoveryNode: string = FALLBACK_NODES[0];
let isNodeSelected = false;

// Fast health check to find a responsive node
const findHealthyNode = async (): Promise<string> => {
  if (isNodeSelected) return discoveryNode;

  const checkNode = async (node: string): Promise<string | null> => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(`${node}/v1/health_check`, { signal: controller.signal });
      clearTimeout(id);
      if (response.ok) return node;
    } catch (e) {
      return null;
    }
    return null;
  };

  // Try nodes in parallel for speed
  const results = await Promise.all(FALLBACK_NODES.map(node => checkNode(node)));
  const healthyNode = results.find(res => res !== null);
  
  if (healthyNode) {
    discoveryNode = healthyNode;
    isNodeSelected = true;
    console.log("SpotyDa connected to:", discoveryNode);
  }
  
  return discoveryNode;
};

// Ensure HTTPS to prevent Mixed Content errors on mobile/secure contexts
const ensureHttps = (url: string) => url?.replace(/^http:/, 'https:');

const formatSeconds = (totalSeconds: number): string => {
  if (!totalSeconds) return "0:00";
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const searchMusic = async (query: string): Promise<Track[]> => {
  if (!query.trim()) return [];
  
  try {
    const node = await findHealthyNode();
    const url = `${node}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=SPOTYDA_APP`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Search request failed");
    
    const { data } = await response.json();
    
    return (data || []).map((item: any) => ({
      id: String(item.id),
      title: item.title,
      artist: item.user?.name || "Unknown Artist",
      album: item.genre || "Audius Track",
      coverUrl: ensureHttps(item.artwork?.["480x480"] || item.artwork?.["150x150"] || `https://api.dicebear.com/7.x/initials/svg?seed=${item.title}`),
      audioUrl: ensureHttps(`${node}/v1/tracks/${item.id}/stream?app_name=SPOTYDA_APP`),
      duration: formatSeconds(item.duration || 0)
    }));
  } catch (e) {
    console.error("Audius Search error:", e);
    return [];
  }
};

export const getRecommendations = async (): Promise<Track[]> => {
  try {
    const node = await findHealthyNode();
    const url = `${node}/v1/tracks/trending?app_name=SPOTYDA_APP`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Trending request failed");
    
    const { data } = await response.json();

    return (data || []).slice(0, 20).map((item: any) => ({
      id: String(item.id),
      title: item.title,
      artist: item.user?.name || "Unknown Artist",
      album: item.genre || "Trending",
      coverUrl: ensureHttps(item.artwork?.["480x480"] || item.artwork?.["150x150"] || `https://api.dicebear.com/7.x/initials/svg?seed=${item.title}`),
      audioUrl: ensureHttps(`${node}/v1/tracks/${item.id}/stream?app_name=SPOTYDA_APP`),
      duration: formatSeconds(item.duration || 0)
    }));
  } catch (e) {
    console.error("Audius Trending error:", e);
    return [];
  }
};
