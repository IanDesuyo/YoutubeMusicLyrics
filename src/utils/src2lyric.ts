export default function src2lyric(src: string) {
  const lyrics = src.split("\n");
  const result: Lyric[] = [];

  lyrics.forEach((lyric, index) => {
    let data = /\[(\d{2}):(\d{2})\.(\d{0,3})\](.*)/.exec(lyric);

    if (data && data.length === 5) {
      const text = data[4].trim();

      if (
        index < 5 &&
        (text.startsWith("作词") || text.startsWith("作曲") || text.startsWith("编曲"))
      )
        return;

      result.push({
        text: text || null,
        time: parseInt(data[1], 10) * 60 + parseInt(data[2], 10) + parseFloat("0." + data[3]),
      });
    }
  });

  return result;
}

export function musixmatchLyric2dict(src: string) {
  let data: {
    text: string;
    time: { total: number };
  }[] = JSON.parse(src);
  const result: Lyric[] = [];

  data.forEach(item => {
    result.push({
      text: item.text,
      time: item.time.total,
    });
  });

  return result;
}
