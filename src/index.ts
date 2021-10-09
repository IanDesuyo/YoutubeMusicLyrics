import { version, author } from "../package.json";
import { fetchNeteaseMusicLyrics } from "./api/neteaseMusic";
import fetchSongs from "./lyricManager";
import {
  createContainerElement,
  createLyricButtonElement,
  createStyleElement,
  renderLyrics,
} from "./render";
import { artistFormatter, titleFormatter } from "./utils/formatter";
import { setValue } from "./utils/GM";

var currentState: Song;
var timeObserver: MutationObserver;
var lyricButtonEl: HTMLElement;
var lyricContainerEl: HTMLElement;
var lyricListEl: HTMLElement;
var lyricDelay: number = 0.0;
var songDatas: SongData[] = [];
var selectedSong: number = 0;

function init() {
  console.log(`[YoutubeMusicLyrics] ${version}, Made by ${author}`);

  function toogleLyric(e: MouseEvent) {
    lyricButtonEl.classList.toggle("active");
    lyricContainerEl.classList.toggle("active");
  }
  function toogleTranslation(e: MouseEvent) {
    if (e.button === 1) {
      setValue("NoTranslation", lyricContainerEl.classList.toggle("no-translation"));
    }
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

  function changeLyric(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const num = prompt(
      songDatas
        .map(
          (song, index) =>
            `(${song.source === LyricSource.Musixmatch ? "MX" : ""}${index + 1}) ` +
            `${song.title} - ${song.artists.join(",")} - ${song.album}`
        )
        .join("\n")
    );
    if (num) {
      const idx = parseInt(num);
      if (idx > 0 && idx <= songDatas.length) {
        selectedSong = idx - 1;
      }
    }
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
    if (artists.length === 0) {
      const complexStrings = document
        .querySelector(".content-info-wrapper .complex-string")
        ?.getAttribute("title")
        ?.split(" • ");
      if (complexStrings) {
        artists.push(complexStrings[0]);
      }
    }

    const isMV = !album; // MV don't have album

    if (!title || artists.length === 0) {
      return;
    }

    currentState = {
      title: title,
      artists: artists,
    };

    if (prevState && prevState === currentState) {
      return;
    }

    console.log("[YoutubeMusicLyrics] Song changed, currentState:", {
      ...currentState,
      isMV: isMV,
    });

    if (timeObserver) {
      timeObserver.disconnect();
    }

    const formatedTitle = titleFormatter(title, artists, isMV);
    const formatedArtists = artistFormatter(title, artists, isMV);

    songDatas = await fetchSongs(formatedTitle, formatedArtists);
    let currentSong = (selectedSong = 0);
    let lyricReversed: Lyric[] = [];
    let currentLyric: Lyric;

    await loadLyric();

    async function loadLyric() {
      console.log("[YoutubeMusicLyrics] Loading lyric...", songDatas[currentSong]);
      if (
        songDatas[currentSong].source === LyricSource.NeteaseMusic &&
        !songDatas[currentSong].data
      ) {
        const lr = await fetchNeteaseMusicLyrics(parseInt(songDatas[currentSong].id));
        if (lr) {
          songDatas[currentSong].data = lr;
        }
      }

      lyricListEl = renderLyrics(lyricContainerEl, songDatas[currentSong].data);
      lyricDelay = 0.0;
      lyricButtonEl.removeAttribute("title");
      lyricReversed = songDatas[currentSong].data?.reverse() || [];
    }

    async function timeChangeCallback(mutations: MutationRecord[]) {
      try {
        const matation = mutations.find(mutation => mutation.type === "characterData");
        const timeMatch = /^\s*(\d+):(\d+)/.exec(matation.target.textContent);
        const currentTime = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
        const preventLyric = currentLyric;
        currentLyric = lyricReversed.find(x => x.time <= currentTime + 0.5 + lyricDelay);

        if (currentSong !== selectedSong) {
          currentSong = selectedSong;
          await loadLyric();
        }

        if (currentLyric !== preventLyric) {
          lyricListEl.querySelectorAll(`li`).forEach(li => {
            li?.classList?.remove("active");
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
      } catch (e) {
        console.error(e);
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
    contextmenu: changeLyric,
    auxclick: toogleTranslation,
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
try {
  init();
} catch (e) {
  console.error(e);
}
