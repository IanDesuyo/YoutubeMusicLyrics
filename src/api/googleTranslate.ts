import { request } from "../utils/GM";

export default async function translate(sl: string = "zh-cn", tl: string = "zh-tw", text: string) {
  return request(
    "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t" +
      `&sl=${sl}&tl=${tl}` +
      `&q=${encodeURI(text)}`
  ).then(res => {
    let translated = "";

    res.data[0]?.forEach((row: string[]) => {
      translated += row[0];
    });

    return translated;
  });
}
