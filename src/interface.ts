const enum Language {
  Japanese = "ja",
  English = "en",
  ChineseSimplified = "zh-CN",
  ChineseTraditional = "zh-TW",
}

const enum ZHConverter {
  Simplified = "Simplified",
  Traditional = "Traditional",
  China = "China",
  Hongkong = "Hongkong",
  Taiwan = "Taiwan",
  WikiSimplified = "WikiSimplified",
  WikiTraditional = "WikiTraditional",
}

const enum LyricSource {
  NeteaseMusic = "NeteaseMusic",
  Musixmatch = "Musixmatch",
  Unknown = "Unknown",
}

interface Song {
  title: string;
  artists: string[];
}

interface SongData extends Song {
  source: LyricSource;
  album: string;
  length: number;
  id: string;
  data?: any;
}

interface Lyric {
  text: string;
  translated?: string;
  time: number;
}

interface FormatData {
  [artist: string]: { name: string; regex: string[] };
}

interface EndpointElement extends HTMLElement {
  data: {
    browseEndpoint: {
      browseEndpointContextSupportedConfigs: {
        browseEndpointContextMusicConfig: {
          pageType: EndpointPageType;
        };
      };
    };
  };
}

const enum EndpointPageType {
  Artist = "MUSIC_PAGE_TYPE_ARTIST",
  Album = "MUSIC_PAGE_TYPE_ALBUM",
  Unknown = "MUSIC_PAGE_TYPE_UNKNOWN",
}

interface MusixmatchResponseHeader {
  status_code: number;
  execute_time: number;
}

interface MusixmatchResponse {
  message: {
    header: MusixmatchResponseHeader;
    body: {
      macro_calls: {
        "matcher.track.get": {
          message: {
            header: MusixmatchResponseHeader;
            body?: {
              track: {
                track_name: string;
                album_name: string;
                artist_name: string;
                track_length: number;
              };
            };
          };
        };
        "track.subtitles.get": {
          message: {
            header: MusixmatchResponseHeader;
            body?: {
              subtitle_list: {
                subtitle: {
                  subtitle_language: Language;
                  subtitle_body: string;
                };
              }[];
            };
          };
        };
        "track.lyrics.get": {
          message: {
            header: MusixmatchResponseHeader;
            body?: {
              lyrics: {
                lyrics_language: Language;
                lyrics_body: string;
              };
            };
          };
        };
      };
    };
  };
}

interface NeteaseMusicResponse {
  code: number;
  result: {
    songCount: number;
    songs: {
      name: string;
      alia: string[];
      ar: {
        name: string;
        alias: string[];
      }[];
      al: {
        name: string;
      };
      dt: number; // milliseconds
      id: number;
    }[];
  };
}

interface NeteaseMusicLyricsResponse {
  code: number;
  lrc?: {
    lyric: string;
  };
  tlyric?: {
    lyric: string;
  };
}
