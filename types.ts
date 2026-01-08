
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
}

export interface Playlist {
  id: string;
  title: string;
  tracks: Track[];
  createdAt: number;
}

export interface Recommendation {
  id: string;
  category: string;
  tracks: Track[];
}

export enum AppSection {
  HOME = 'home',
  SEARCH = 'search',
  LIBRARY = 'library',
  DISCOVER = 'discover',
  PLAYLIST = 'playlist'
}

export interface TranscriptionItem {
  role: 'user' | 'model';
  text: string;
}
