# Youtube Music Lyrics

A userscript to add lyric support for Youtube Music.

## Screenshot

![screenshot_1](https://raw.github.com/IanDesuyo/YoutubeMusicLyrics/master/screenshots/1.png)
![screenshot_2](https://raw.github.com/IanDesuyo/YoutubeMusicLyrics/master/screenshots/2.png)

## Features

Click on the lyrics area to toggle fullscreen mode

### Lyrics button

- Left click to toggle lyrics
- Right click to change the source of lyrics
- Middle click to toggle Chinese translation

## How to use

1. Clone this repo
2. Edit `.env` file, change `CLOUDMUSIC_API`(Host it by yourself) and `MUSIXMATCH_USERTOKEN`(You can find it when using Spotify) to yours
3. Run `npm install` and `npm run build`
4. Import `dist/ytml.user.js` to Tampermonkey
5. Done 🎉

## How it work

- Use [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to listen events
- Fetch lyrics using [`NeteaseCloudMusicApi`](https://github.com/Binaryify/NeteaseCloudMusicApi) and [`musixmatch`](https://www.musixmatch.com)
- Render lyrics with javascript!

## Acknowledgements

- [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)
- [mantou132/Spotify-Lyrics](https://github.com/mantou132/Spotify-Lyrics)
