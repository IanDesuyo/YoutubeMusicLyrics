import { request } from "../utils/GM";
import { musixmatchLyric2dict } from "../utils/src2lyric";

const apiUrl =
  "https://apic-desktop.musixmatch.com/ws/1.1/macro.subtitles.get" +
  "?format=json&namespace=lyrics_synched" +
  "&f_subtitle_length_max_deviation=1&subtitle_format=mxm" +
  `&app_id=web-desktop-app-v1.0&usertoken=${process.env.MUSIXMATCH_USERTOKEN}`;

export default async function fetchMusixmatch(
  title: string,
  artists: string[],
  targetLang: Language = Language.Japanese
): Promise<SongData> {
  return request(`${apiUrl}&user_language=${targetLang}&q_track=${title} ${artists.join(" ")}`, {
    headers: {
      Origin: "musixmatch.com",
    },
  })
    .then(res => {
      const data: MusixmatchResponse = res.data;

      const track = data.message.body.macro_calls["matcher.track.get"].message.body?.track;
      if (!track) {
        return null;
      }

      const result: SongData = {
        title: track.track_name,
        artists: [track.artist_name],
        album: track.album_name,
        length: track.track_length,
        source: LyricSource.Musixmatch,
        id: "musixmatch",
      };

      const subtitles =
        data.message.body.macro_calls["track.subtitles.get"].message.body?.subtitle_list;
      if (subtitles) {
        result.data = musixmatchLyric2dict(subtitles[0].subtitle.subtitle_body);
      }

      console.log("[YoutubeMusicLyrics] fetchMusixmatch", result);
      return result;
    })
    .catch(err => {
      console.error("[YoutubeMusicLyrics] fetchMusixmatch", err);
      return null;
    });
}
