import { name, version, author } from "../package.json";
import fetchMusixmatch from "./api/musixmatch";
import fetchNeteaseMusic from "./api/neteaseMusic";
import { createElements, renderLyrics } from "./render";
import { artistFormatter, titleFormatter } from "./utils/formatter";

var currentState: Song;
var timeObserver: MutationObserver;
var lyricActive: boolean = false;
var lyricFullscreenActive: boolean = false;
var lyricButtonEl: HTMLElement;
var lyricContainerEl: HTMLElement;
var lyricDelay: number = 0.0;

function init() {
  console.log(name, version, `Made by ${author}`);

  function toogleLyric(e: MouseEvent) {
    lyricActive = !lyricActive;
    lyricFullscreenActive = false;

    lyricButtonEl.classList.toggle("active");
    lyricContainerEl.classList.toggle("active");
  }

  function toogleFullscreen(e: MouseEvent) {
    e.preventDefault();
    lyricFullscreenActive = !lyricFullscreenActive;

    lyricContainerEl.classList.toggle("fullscreen");
  }

  function changeLyricDelay(e: WheelEvent) {
    e.preventDefault();
    e.deltaY > 0 ? (lyricDelay += 0.1) : (lyricDelay -= 0.1);

    lyricButtonEl.title = `${lyricDelay.toFixed(1)}s`;
  }

  async function songChangeCallback(mutations: MutationRecord[]) {
    const prevState = { ...currentState };

    const title = document.querySelector(".content-info-wrapper .title")?.textContent;
    const artists: string[] = [];
    let album: string;

    const endpoints = document.querySelectorAll(".content-info-wrapper .yt-simple-endpoint");
    for (const endpoint of endpoints as unknown as EndpointElement[]) {
      const type =
        endpoint.data.browseEndpoint?.browseEndpointContextSupportedConfigs
          ?.browseEndpointContextMusicConfig?.pageType;

      if (type === EndpointPageType.Album) {
        album = endpoint.textContent;
      } else if (
        type === EndpointPageType.Artist ||
        type === EndpointPageType.Unknown // Track is uploaded by user
      ) {
        artists.push(endpoint.textContent);
      }
    }

    const isMV = !album; // MV don't have album

    if (!title || artists.length === 0) {
      return;
    }

    console.log(title, artists, isMV);

    currentState = {
      title: title,
      artists: artists,
    };

    if (prevState && prevState === currentState) {
      return;
    }

    if (timeObserver) {
      timeObserver.disconnect();
    }

    const formatedTitle = titleFormatter(title, artists, isMV);
    const formatedArtists = artistFormatter(title, artists, isMV);

    const lyric =
      (await fetchNeteaseMusic(formatedTitle, formatedArtists)) ||
      (await fetchMusixmatch(formatedTitle, formatedArtists));

    // renderLyrics(lyricContainerEl, lyric);

    if (!lyric) return (lyricContainerEl.innerHTML = "");

    const lyricReversed = lyric.reverse();
    
    lyricDelay = 0.0;

    function timeChangeCallback(mutations: MutationRecord[]) {
      const matation = mutations.find(mutation => mutation.type === "characterData");
      const timeMatch = /^\s*(\d+):(\d+)/.exec(matation.target.textContent);
      const currentTime = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
      const currentLyric = lyricReversed.find(x => x.time <= currentTime + 0.5 + lyricDelay);

      let lyric = currentLyric?.text || "";

      if (currentLyric?.translated) {
        lyric += ` / ${currentLyric.translated}`;
      }

      lyricContainerEl.innerHTML = lyric;
    }

    timeObserver = new MutationObserver(timeChangeCallback);
    timeObserver.observe(document.querySelector(".time-info"), {
      characterData: true,
      subtree: true,
    });
  }

  [lyricButtonEl, lyricContainerEl] = createElements(
    toogleLyric,
    toogleFullscreen,
    changeLyricDelay
  );
  const observer = new MutationObserver(songChangeCallback);
  observer.observe(document.querySelector(".content-info-wrapper"), {
    childList: true,
    subtree: true,
  });
}

init();
