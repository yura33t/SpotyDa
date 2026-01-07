import { Track } from "../types.ts";

interface MusicProvider {
  search: (query: string) => Promise<Track[]>;
  getTrending: () => Promise<Track[]>;
}

class AudiusProvider implements MusicProvider {
  private nodes = [
    "https://discoveryprovider.audius.co",
    "https://audius-discovery-1.thenode.io",
    "https://discovery-us-01.audius.openplayer.org",
    "https://discoveryprovider.audius.club"
  ];
  private cachedNode: string | null = null;

  private async getBestNode(): Promise<string> {
    if (this.cachedNode) return this.cachedNode;
    for (const node of this.nodes) {
      try {
        const res = await fetch(`${node}/v1/health_check`, { signal: AbortSignal.timeout(1500) });
        if (res.ok) {
          this.cachedNode = node;
          return node;
        }
      } catch (e) { continue; }
    }
    return this.nodes[0];
  }

  private resolveArtwork(item: any, node: string) {
    const directUrl = item.artwork?.["480x480"] || item.artwork?.["150x150"];
    if (directUrl) return directUrl.replace(/^http:/, 'https:');
    return `${node}/v1/tracks/${item.id}/artwork?size=480x480`;
  }

  async search(query: string): Promise<Track[]> {
    const node = await this.getBestNode();
    const res = await fetch(`${node}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=SPOTYDA`);
    const { data } = await res.json();
    return (data || []).map((item: any) => this.mapTrack(item, node));
  }

  /**
   * Получаем рекомендации, ориентированные на русский сегмент.
   * Теперь мы берем несколько случайных категорий и смешиваем их.
   */
  async getTrending(): Promise<Track[]> {
    const node = await this.getBestNode();
    
    // Расширенный список для более живой ленты
    const russianTags = [
      "Russian Pop", "Russian Rap", "Русский хип-хоп", "Phonk Russian", 
      "Deep House Russian", "Russian Indie", "Russian Rock", "Miyagi", 
      "Скриптонит", "Элджей", "Pharaoh", "Zivert", "Instasamka", 
      "HammAli & Navai", "MACAN", "GSPD", "Dead Blonde"
    ];

    // Выбираем 3 случайных тега для микса
    const shuffledTags = [...russianTags].sort(() => 0.5 - Math.random());
    const selectedTags = shuffledTags.slice(0, 3);

    try {
      // Запрашиваем треки по выбранным тегам параллельно
      const results = await Promise.all(
        selectedTags.map(tag => 
          fetch(`${node}/v1/tracks/search?query=${encodeURIComponent(tag)}&limit=15&app_name=SPOTYDA`)
            .then(res => res.json())
            .then(json => json.data || [])
        )
      );

      // Собираем всё в один список
      let combinedTracks = results.flat().map((item: any) => this.mapTrack(item, node));

      // Убираем дубликаты по ID
      const uniqueTracks = Array.from(new Map(combinedTracks.map(track => [track.id, track])).values());

      // Перемешиваем результат для ощущения "новой ленты"
      return uniqueTracks.sort(() => 0.5 - Math.random()).slice(0, 40);

    } catch (e) {
      console.warn("Russian feed generation failed, falling back to global trending");
      const res = await fetch(`${node}/v1/tracks/trending?limit=30&app_name=SPOTYDA`);
      const { data } = await res.json();
      return (data || []).map((item: any) => this.mapTrack(item, node));
    }
  }

  private mapTrack(item: any, node: string): Track {
    return {
      id: String(item.id),
      title: item.title,
      artist: item.user?.name || "Unknown Artist",
      album: item.genre || "Music",
      coverUrl: this.resolveArtwork(item, node),
      audioUrl: `${node}/v1/tracks/${item.id}/stream?app_name=SPOTYDA`.replace(/^http:/, 'https:'),
      duration: `${Math.floor(item.duration / 60)}:${Math.floor(item.duration % 60).toString().padStart(2, '0')}`
    };
  }
}

const provider: MusicProvider = new AudiusProvider();

export const searchMusic = (query: string) => provider.search(query);
export const getRecommendations = () => provider.getTrending();
export const findBestNode = async () => "ready";
