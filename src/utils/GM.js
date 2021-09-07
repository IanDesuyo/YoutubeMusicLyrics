export async function request(url, ...options) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      url,
      method: "GET",
      onload: res => {
        return resolve({ data: JSON.parse(res.responseText) });
      },
      onabort: reject,
      onerror: reject,

      ...options,
    });
  });
}

export function setValue(key, value) {
  return GM_setValue(key, value);
}

export function getValue(key, defaultValue) {
  return GM_getValue(key, defaultValue);
}
