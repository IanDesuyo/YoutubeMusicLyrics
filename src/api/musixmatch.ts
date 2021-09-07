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
): Promise<Lyric[]> {
  console.log("fetchMusixmatch", title, artists);

  return request(`${apiUrl}&user_language=${targetLang}&q_track=${title} ${artists.join(" ")}`, {
    headers: {
      Origin: "musixmatch.com",
    },
  })
    .then(res => {
      const {
        message: {
          body: { macro_calls },
        },
      } = res.data;
      const subtitle_list = macro_calls["track.subtitles.get"]?.message?.body?.subtitle_list;

      if (subtitle_list && subtitle_list.length > 0) {
        const subs = subtitle_list[0].subtitle.subtitle_body;

        return subs === "" ? null : musixmatchLyric2dict(subs);
      } else if (macro_calls["matcher.track.get"]?.message?.body) {
        const info = macro_calls["matcher.track.get"].message.body.track;

        if (info.instrumental) return { text: "Instrumental track.", time: 0 };
      }
    })
    .catch(err => {
      console.error("fetchMusixmatch", err);
      return null;
    });
}
