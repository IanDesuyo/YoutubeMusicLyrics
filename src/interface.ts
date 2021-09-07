const enum Language {
  Japanese = "ja",
  English = "en",
  ChineseSimplified = "zh-CN",
  ChineseTraditional = "zh-TW",
}

interface Lyric {
  text: string;
  translated?: string;
  time: number;
}

interface Song {
  title: string;
  artists: string[];
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

interface FormatData {
  [artist: string]: { name: string; regex: string[] };
}
