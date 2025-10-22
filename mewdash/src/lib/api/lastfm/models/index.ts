export interface LastFmStatus {
  linked: boolean;
  username: string | null;
  scrobblingEnabled: boolean;
}

export interface LastFmUserInfo {
  username: string;
  playcount: number;
  country: string;
  avatar: string | null;
}

export interface LastFmTrack {
  name: string;
  artist: string;
  album: string;
  url: string;
  image: string | null;
  isNowPlaying: boolean;
  timePlayed: Date | null;
}

export interface LastFmArtist {
  name: string;
  playcount: number;
  url: string;
  image: string | null;
}

export interface LastFmAlbum {
  name: string;
  artist: string;
  playcount: number;
  url: string;
  image: string | null;
}
