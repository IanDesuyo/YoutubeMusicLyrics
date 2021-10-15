import { request } from "../utils/GM";
import src2lyric from "../utils/src2lyric";
import zhconvert from "./zhconvert";
import googleTranslate from "./googleTranslate";

export default async function fetchNeteaseMusic(
  title: string,
  artists: string[]
): Promise<SongData[]> {
  return request(`${process.env.CLOUDMUSIC_API}/cloudsearch?keywords=${title} ${artists.join(" ")}`)
    .then(res => {
      const data: NeteaseMusicResponse = res.data;
      const result: SongData[] = [];
      const others: SongData[] = [];

      for (const song of data.result.songs) {
        const songTitle = song.name.toLowerCase();
        const songAlias = song.alia.map(a => a.toLowerCase());

        const songArtists = song.ar.map(artist => artist.name.toLowerCase());
        const songArtistsAlias = song.ar.map(artist =>
          artist.alias.map(alias => alias.toLowerCase())
        );

        const res: SongData = {
          title: song.name,
          artists: song.ar.map(artist => artist.name),
          album: song.al.name,
          length: song.dt / 1000,
          source: LyricSource.NeteaseMusic,
          id: song.id.toString(),
        };
        if (songTitle === title || songAlias?.includes(title)) {
          if (
            songArtists.some(artist => artists.includes(artist)) ||
            songArtistsAlias.some(artist => artists.some(a => artist.includes(a)))
          ) {
            result.unshift(res);
          } else {
            result.push(res);
          }
        } else {
          others.push(res);
        }
      }

      console.log("[YoutubeMusicLyrics] fetchNeteaseMusic", result, others);
      return [...result, ...others];
    })
    .catch(err => {
      console.error("[YoutubeMusicLyrics] fetchNeteaseMusic", err);
      return [];
    });
}

export async function fetchNeteaseMusicLyrics(songId: number): Promise<Lyric[]> {
  console.log("[YoutubeMusicLyrics] fetchNeteaseMusicLyrics", songId);
  return request(`${process.env.CLOUDMUSIC_API}/lyric?id=${songId}`)
    .then(async res => {
      const data: NeteaseMusicLyricsResponse = res.data;
      if (!data.lrc) {
        return null;
      }

      const lyric = src2lyric(data.lrc.lyric);

      if (data.tlyric?.lyric) {
        let translated: string;
        if (process.env.USE_ZHCONVERT == "true") {
          translated = await zhconvert(ZHConverter.Taiwan, data.tlyric.lyric);
        } else {
          translated = await googleTranslate(
            Language.ChineseSimplified,
            Language.ChineseTraditional,
            data.tlyric.lyric
          );
        }
        const tlyric = await src2lyric(translated);

        if (lyric.length === tlyric.length) {
          for (let i = 0; i < lyric.length; i++) {
            lyric[i].translated = tlyric[i].text;
          }
        } else {
          for (let i = 0; i < lyric.length; i++) {
            for (let j = 0; j < tlyric.length; j++) {
              if (lyric[i].time == tlyric[j].time) {
                lyric[i].translated = tlyric[j].text;
                break;
              }
            }
          }
        }
      }

      console.log("[YoutubeMusicLyrics] fetchNeteaseMusicLyrics", lyric);
      return lyric;
    })
    .catch(err => {
      console.error("[YoutubeMusicLyrics] fetchNeteaseMusicLyrics", err);
      return null;
    });
}
