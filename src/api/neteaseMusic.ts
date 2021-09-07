import { request } from "../utils/GM";
import src2lyric from "../utils/src2lyric";
import translate from "./googleTranslate";

export default async function fetchNeteaseMusic(title: string, artists: string[]) {
  console.log("fetchNeteaseMusic");

  const songIds = await fetchNeteaseMusicID(title, artists);

  for (let i = 0; i < (songIds.length <= 5 ? songIds.length : 5); i++) {
    const lyric = await fetchNeteaseMusicLyrics(songIds[i]);
    if (lyric) return lyric;
  }
}

async function fetchNeteaseMusicID(title: string, artists: string[]): Promise<number[]> {
  console.log("fetchNeteaseMusicID", title, artists);
  return request(`${process.env.CLOUDMUSIC_API}/cloudsearch?keywords=${title} ${artists.join(" ")}`)
    .then(res => {
      const {
        result: { songs: songs },
      } = res.data;

      let reslutIds: number[] = [];

      songs.forEach(
        (song: { name: string; ar: { name: string }[]; id: number; tns?: string[] }) => {
          let songTitle = song.name.toLowerCase();
          if (
            (songTitle === title || song.tns?.includes(title)) &&
            artists.includes(song.ar[0].name.toLowerCase())
          ) {
            reslutIds.unshift(song.id);
          } else if (songTitle === title) {
            reslutIds.push(song.id);
          }
        }
      );

      return reslutIds;
    })
    .catch(err => {
      console.error("fetchNeteaseMusicID", err);
      return [];
    });
}

async function fetchNeteaseMusicLyrics(songId: number): Promise<Lyric[]> {
  console.log("fetchNeteaseMusicLyrics", songId);
  return request(`${process.env.CLOUDMUSIC_API}/lyric?id=${songId}`)
    .then(async res => {
      if (!res.data?.lrc || !res.data.lrc?.lyric) return null;

      const lyric = src2lyric(res.data.lrc.lyric);

      if (res.data.tlyric?.lyric && true) {
        const tlyric = await src2lyric(await translate("zh-cn", "zh-tw", res.data.tlyric.lyric));

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

      return lyric;
    })
    .catch(err => {
      console.error("fetchNeteaseMusicID", err);
      return null;
    });
}
