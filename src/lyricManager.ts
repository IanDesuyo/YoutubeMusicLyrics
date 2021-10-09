import fetchMusixmatch from "./api/musixmatch";
import fetchNeteaseMusic from "./api/neteaseMusic";

export default async function fetchSongs(title: string, artists: string[]) {
  const lyrics: SongData[] = [];

  const mx = await fetchMusixmatch(title, artists);
  if (mx) {
    lyrics.push(mx);
  }

  const nm = await fetchNeteaseMusic(title, artists);
  if (nm.length > 0) {
    lyrics.push(...nm);
  }

  console.log(`{[YoutubeMusicLyrics] Lyrics found: ${lyrics.length}`);
  return lyrics;
}
