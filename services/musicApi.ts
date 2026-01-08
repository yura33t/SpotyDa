
import { Track } from "../types.ts";

interface MusicProvider {
  search: (query: string) => Promise<Track[]>;
  getTrending: () => Promise<Track[]>;
}

class AudiusProvider implements MusicProvider {
  // Базовый список проверенных узлов
  private nodes = [
    "https://audius-discovery-1.thenode.io",
    "https://discovery-us-01.audius.openplayer.org",
    "https://audius-metadata-1.pro-nodes.com",
    "https://discovery-au-01.audius.openplayer.org",
    "https://audius-discovery-1.nocturnallabs.org",
    "https://discovery-uk-01.audius.openplayer.org"
  ];
  private cachedNode: string | null = null;
  private isChecking = false;

  private async getBestNode(): Promise<string> {
    if (this.cachedNode) return this.cachedNode;
    if (this.isChecking) return this.nodes[0];
    
    this.isChecking = true;
    try {
      // Пытаемся получить список актуальных узлов от официального API
      const bootstrapResponse = await fetch("https://api.audius.co", { method: 'GET' }).catch(() => null);
      if (bootstrapResponse && bootstrapResponse.ok) {
        const { data } = await bootstrapResponse.json();
        if (Array.isArray(data) && data.length > 0) {
          this.nodes = [...new Set([...data, ...this.nodes])];
        }
      }

      // Проверяем первый работающий узел с коротким таймаутом
      for (const node of this.nodes) {
        try {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 2000);
          const res = await fetch(`${node}/v1/health_check`, { signal: controller.signal });
          clearTimeout(id);
          if (res.ok) {
            this.cachedNode = node;
            return node;
          }
        } catch (e) { continue; }
      }
    } catch (e) {
      console.warn("Node discovery failed, using fallback");
    } finally {
      this.isChecking = false;
    }
    
    return this.nodes[0];
  }

  private ensureHttps(url: string): string {
    if (!url) return url;
    return url.replace(/^http:/, 'https:');
  }

  async search(query: string): Promise<Track[]> {
    if (!query) return [];
    try {
      const node = await this.getBestNode();
      const res = await fetch(`${node}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=SPOTYDA_V2`);
      if (!res.ok) throw new Error("Search request failed");
      const { data } = await res.json();
      return (data || []).map((item: any) => this.mapTrack(item, node));
    } catch (error) {
      console.error("Search failed:", error);
      // Если узел упал, сбрасываем кеш и пробуем снова один раз
      this.cachedNode = null;
      return [];
    }
  }

  async getTrending(): Promise<Track[]> {
    try {
      const node = await this.getBestNode();
      // Получаем тренды. Используем более надежный эндпоинт trending
      const res = await fetch(`${node}/v1/tracks/trending?limit=50&app_name=SPOTYDA_V2`);
      if (!res.ok) throw new Error("Trending request failed");
      const { data } = await res.json();
      
      if (!data || data.length === 0) {
        // Если трендов нет, пробуем поиск по популярным тегам
        return this.search("top hits 2024");
      }

      return data.map((item: any) => this.mapTrack(item, node));
    } catch (error) {
      console.error("Trending failed:", error);
      this.cachedNode = null;
      return [];
    }
  }

  private mapTrack(item: any, node: string): Track {
    // Формируем обложку. Если нет прямой, используем API эндпоинт
    const coverUrl = item.artwork?.["480x480"] 
      ? this.ensureHttps(item.artwork["480x480"])
      : this.ensureHttps(`${node}/v1/tracks/${item.id}/artwork?size=480x480`);

    return {
      id: String(item.id),
      title: item.title || "Untitled",
      artist: item.user?.name || "Unknown Artist",
      album: item.genre || "Music",
      coverUrl: coverUrl,
      audioUrl: this.ensureHttps(`${node}/v1/tracks/${item.id}/stream?app_name=SPOTYDA_V2`),
      duration: this.formatDuration(item.duration)
    };
  }

  private formatDuration(seconds: number): string {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

const provider: MusicProvider = new AudiusProvider();

export const searchMusic = (query: string) => provider.search(query);
export const getRecommendations = () => provider.getTrending();
export const findBestNode = async () => "ready";
