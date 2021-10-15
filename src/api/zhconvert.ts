import { request } from "../utils/GM";

export default async function translate(converter: ZHConverter = ZHConverter.Taiwan, text: string) {
  return request("https://api.zhconvert.org/convert", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    data: JSON.stringify({
      converter: converter,
      text: text,
    }),
  }).then(res => {
    if (res.data.data?.text) {
      return res.data.data.text;
    }

    return null;
  });
}
