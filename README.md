# Youtube Music Lyrics

A userscript to add lyric support for Youtube Music.

## Screenshot

![screenshot_1](https://raw.github.com/IanDesuyo/YoutubeMusicLyrics/master/screenshots/1.png)
![screenshot_2](https://raw.github.com/IanDesuyo/YoutubeMusicLyrics/master/screenshots/2.png)


## How it work

- Use [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to listen events
- Fetch lyrics using [`NeteaseCloudMusicApi`](https://github.com/Binaryify/NeteaseCloudMusicApi) and [`musixmatch`](https://www.musixmatch.com)
- Render lyrics with javascript!

## Acknowledgements

- [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)
- [mantou132/Spotify-Lyrics](https://github.com/mantou132/Spotify-Lyrics)