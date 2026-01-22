
import { Track } from "../types.ts";

const SC_CLIENT_ID = "OelGkhXfXWOqCdtdJyDkt5rBWc2GF4xR";
const SC_CLIENT_SECRET = "PjfZSquNGebF9LKetZ7FXaFd5xwo3KSv";
const API_BASE = "https://api.soundcloud.com";

let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Получает OAuth токен через поток Client Credentials.
 * Это самый надежный способ авторизации для серверных и браузерных запросов.
 */
async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', SC_CLIENT_ID);
    params.append('client_secret', SC_CLIENT_SECRET);

    const response = await fetch(`${API_BASE}/oauth2/token`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: params
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("SoundCloud Auth Error Detail:", errorData);
      throw new Error(`Auth failed: ${response.status}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Запас в 5 минут до истечения
    tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 300000;
    console.log("SoundCloud Access Token renewed");
    return accessToken!;
  } catch (error) {
    console.error("Critical SoundCloud Auth Failure:", error);
    throw error;
  }
}

/**
 * Преобразование данных из SoundCloud API в формат приложения.
 */
function mapSCTrack(item: any): Track {
  const artwork = item.artwork_url || item.user?.avatar_url || "";
  const hiResArtwork = artwork.replace("-large.jpg", "-t500x500.jpg");
  
  return {
    id: `sc-${item.id}`,
    title: item.title || "Без названия",
    artist: item.user?.username || "Неизвестный исполнитель",
    album: item.genre || "SoundCloud",
    coverUrl: hiResArtwork || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500`,
    audioUrl: item.stream_url || "",
    duration: formatSCDuration(item.duration)
  };
}

function formatSCDuration(ms: number): string {
  if (!ms) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Поиск музыки. Использует заголовок Authorization для предотвращения 401.
 */
export async function searchMusic(query: string): Promise<Track[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const token = await getAccessToken();
    const response = await fetch(
      `${API_BASE}/tracks?q=${encodeURIComponent(q)}&limit=30`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    if (response.status === 401) {
      accessToken = null; // Сбрасываем токен, если он вдруг протух
      return searchMusic(query);
    }

    if (!response.ok) return [];

    const data = await response.json();
    return (data.collection || data || [])
      .filter((t: any) => t.streamable && t.stream_url)
      .map((t: any) => mapSCTrack(t));
  } catch (error) {
    console.error("SoundCloud Search Error:", error);
    return [];
  }
}

/**
 * Рекомендации.
 */
export async function getRecommendations(): Promise<Track[]> {
  try {
    const token = await getAccessToken();
    
    // Используем популярные теги для получения списка треков
    const tags = ['phonk', 'pop', 'hiphop', 'electronic'];
    const tag = tags[Math.floor(Math.random() * tags.length)];
    
    const response = await fetch(
      `${API_BASE}/tracks?tags=${tag}&limit=50&order=created_at`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    if (response.status === 401) {
      accessToken = null;
      return getRecommendations();
    }

    if (!response.ok) return [];

    const data = await response.json();
    return (data.collection || data || [])
      .filter((t: any) => t.streamable && t.stream_url)
      .map((t: any) => mapSCTrack(t));
  } catch (error) {
    console.error("SoundCloud Trending Error:", error);
    return [];
  }
}

/**
 * Формирует ссылку для стриминга. 
 * ВАЖНО: SoundCloud возвращает 302 Redirect на реальный медиа-файл.
 */
export async function getStreamUrl(track: Track): Promise<string> {
  if (!track.audioUrl) return "";
  
  try {
    const token = await getAccessToken();
    // Мы возвращаем URL с токеном в параметрах, так как HTML5 Audio не умеет слать кастомные заголовки
    const separator = track.audioUrl.includes('?') ? '&' : '?';
    return `${track.audioUrl}${separator}oauth_token=${token}`;
  } catch (error) {
    return track.audioUrl;
  }
}
