
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
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
  DISCOVER = 'discover'
}

export interface TranscriptionItem {
  role: 'user' | 'model';
  text: string;
}
