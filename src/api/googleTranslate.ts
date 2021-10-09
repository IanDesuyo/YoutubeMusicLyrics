import { request } from "../utils/GM";

export default async function translate(
  form: Language = Language.ChineseSimplified,
  to: Language = Language.ChineseTraditional,
  text: string
) {
  return request(
    "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t" +
      `&sl=${form}&tl=${to}` +
      `&q=${encodeURI(text)}`
  ).then(res => {
    let translated = "";

    res.data[0]?.forEach((row: string[]) => {
      translated += row[0];
    });

    return translated;
  });
}
