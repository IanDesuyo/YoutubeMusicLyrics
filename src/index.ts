import { name, version, author } from "../package.json";
import fetchMusixmatch from "./api/musixmatch";
import fetchNeteaseMusic from "./api/neteaseMusic";
import {
  createContainerElement,
  createLyricButtonElement,
  createStyleElement,
  renderLyrics,
} from "./render";
import { artistFormatter, titleFormatter } from "./utils/formatter";

var currentState: Song;
var timeObserver: MutationObserver;
var lyricButtonEl: HTMLElement;
var lyricContainerEl: HTMLElement;
var lyricListEl: HTMLElement;
var lyricDelay: number = 0.0;

function init() {
  console.log(name, version, `Made by ${author}`);

  function toogleLyric(e: MouseEvent) {
    lyricButtonEl.classList.toggle("active");
    lyricContainerEl.classList.toggle("active");
  }

  function changeLyricDelay(e: WheelEvent) {
    e.preventDefault();
    e.deltaY > 0 ? (lyricDelay += 0.1) : (lyricDelay -= 0.1);

    lyricButtonEl.title = `${lyricDelay.toFixed(1)}s`;
  }

  function toogleFullscreen(e: MouseEvent) {
    e.stopPropagation();
    lyricContainerEl.classList.toggle("fullscreen");
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

    lyricListEl = renderLyrics(lyricContainerEl, lyric);
    lyricDelay = 0.0;
    lyricButtonEl.removeAttribute("title");

    if (!lyric) return;

    const lyricReversed = lyric.reverse();
    let currentLyric: Lyric;

    function timeChangeCallback(mutations: MutationRecord[]) {
      const matation = mutations.find(mutation => mutation.type === "characterData");
      const timeMatch = /^\s*(\d+):(\d+)/.exec(matation.target.textContent);
      const currentTime = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
      const preventLyric = currentLyric;
      currentLyric = lyricReversed.find(x => x.time <= currentTime + 0.5 + lyricDelay);

      if (currentLyric !== preventLyric) {
        lyricListEl.querySelectorAll(`li`).forEach(li => {
          li.classList.remove("active");
        });
        if (currentLyric) {
          const currentLyricEl = lyricListEl.querySelector(
            `li[time="${currentLyric.time}"]`
          ) as HTMLElement;

          currentLyricEl.classList.add("active");
          
          const scrollTo = currentLyricEl.offsetTop - lyricListEl.offsetHeight / 2;

          lyricListEl.scrollTo({
            top: scrollTo,
            behavior: "smooth",
          });
        }
      }
    }

    timeObserver = new MutationObserver(timeChangeCallback);
    timeObserver.observe(document.querySelector(".time-info"), {
      characterData: true,
      subtree: true,
    });
  }

  createStyleElement();
  lyricButtonEl = createLyricButtonElement({
    click: toogleLyric,
    wheel: changeLyricDelay,
  });
  lyricContainerEl = createContainerElement({
    click: toogleFullscreen,
  });

  const observer = new MutationObserver(songChangeCallback);
  observer.observe(document.querySelector(".content-info-wrapper"), {
    childList: true,
    subtree: true,
  });
}

init();
