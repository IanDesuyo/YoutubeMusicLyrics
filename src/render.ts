function html(strings: string) {
  const template = document.createElement("template");

  template.innerHTML = strings.trim();

  return template.content.firstChild;
}

export function createElements(
  buttonClickCallback: EventListenerOrEventListenerObject,
  buttonRclickCallback: EventListenerOrEventListenerObject,
  buttonScrollCallback: EventListenerOrEventListenerObject
) {
  const style = createStyleElement();
  const lyricButtonEl = createLyricButtonElement(
    buttonClickCallback,
    buttonRclickCallback,
    buttonScrollCallback
  );
  const lyricContainerEl = createContainerElement();

  return [lyricButtonEl, lyricContainerEl];
}

function createStyleElement() {
  const style = html(`
    <style id="youtube-lyric">
      .lyric-container {
        display: none;
        grid-column: 1/4;
        text-align: center;
        color: white;
        font-size: x-large;
        min-height: 36px;
      }
      .lyric-container.active {
        display: block;
      }
      .toggle-lyrics.active {
        color: #FFF;
      }
    </style>
  `);

  document.head.appendChild(style);

  return style as HTMLElement;
}

function createLyricButtonElement(
  buttonClickCallback: EventListenerOrEventListenerObject,
  buttonRclickCallback: EventListenerOrEventListenerObject,
  buttonScrollCallback: EventListenerOrEventListenerObject
) {
  const controlsButtons = document.querySelector(".right-controls-buttons.ytmusic-player-bar");

  const lyricButton = html(`
    <tp-yt-paper-icon-button
      class="toggle-lyrics style-scope ytmusic-player-bar"
      icon="yt-icons:subtitles"
      title="Toggle lyrics"
      aria-label="Toggle lyrics"
      role="button"
    >
      <tp-yt-iron-icon id="icon" class="style-scope tp-yt-paper-icon-button">
        <svg
          viewBox="0 0 24 24"
          preserveAspectRatio="xMidYMid meet"
          focusable="false"
          class="style-scope tp-yt-iron-icon"
          style="pointer-events: none; display: block; width: 100%; height: 100%"
        >
          <g class="style-scope tp-yt-iron-icon">
            <path
             d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z"
             class="style-scope tp-yt-iron-icon"
            ></path>
          </g>
        </svg>
      </tp-yt-iron-icon>
    </tp-yt-paper-icon-button>;
  `);

  lyricButton.addEventListener("click", buttonClickCallback);
  lyricButton.addEventListener("contextmenu", buttonRclickCallback);
  lyricButton.addEventListener("wheel", buttonScrollCallback);
  controlsButtons.insertBefore(lyricButton, controlsButtons.childNodes[2]);

  return lyricButton as HTMLElement;
}

function createContainerElement() {
  const playerBar = document.querySelector("ytmusic-player-bar") as HTMLElement;
  playerBar.style.height = "auto";
  playerBar.style.minHeight = "var(--ytmusic-player-bar-height)";
  playerBar.style.width = "100vw";

  const lyricContainer = html(`
    <div 
      class="lyric-container style-scope ytmusic-player-bar"
    ></div>
  `);

  playerBar.appendChild(lyricContainer);

  return lyricContainer as HTMLElement;
}

export function renderLyrics(container: HTMLElement, lyrics: Lyric[] | null) {
  container.innerHTML = "";

  const ul = html(`<ul class="lyric-list"></ul>`);

  if (lyrics === null) {
    const li = document.createElement("li");
    li.innerText = "No lyrics found";
    ul.appendChild(li);
  } else {
    for (const lyric of lyrics) {
      const li = document.createElement("li");
      // add attr time
      li.setAttribute("time", String(lyric.time));

      if (lyric?.text) {
        let text = lyric.text;

        if (lyric?.translated) {
          text += ` / ${lyric.translated}`;
        }

        li.innerText = text;
      } else {
        li.classList.add("non-lyric");
      }

      ul.appendChild(li);
    }
  }

  container.appendChild(ul);
}
