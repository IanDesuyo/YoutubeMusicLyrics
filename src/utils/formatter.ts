const formatData: FormatData = require("../formatData.json");

export function artistFormatter(title: string, artists: string[], isMV: boolean = false): string[] {
  if (title.toLowerCase().indexOf("cover") > -1) {
    return [""];
  }

  artists = artists.map(artist => artist.toLowerCase());

  if (isMV) {
    artists = artists.map(artist => formatData[artist]?.name || artist);
  }

  return artists;
}

export function titleFormatter(title: string, artists: string[], isMV: boolean = false): string {
  title = title.toLowerCase();

  if (isMV) {
    const regexs = formatData[artists[0]]?.regex || [];

    for (const regex of regexs) {
      const result = new RegExp(regex).exec(title);
      console.log(regex, result);

      if (result) {
        return result[1].trim();
      }
    }
  }

  return title.trim();
}
