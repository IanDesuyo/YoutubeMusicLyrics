function html(strings: string) {
  const template = document.createElement("template");

  template.innerHTML = strings.trim();

  return template.content.firstChild;
}

export function createStyleElement() {
  const style = html(`
    <style id="youtube-lyric">
      .lyric-container {
        display: none;
        grid-column: 1/4;
        text-align: center;
        color: white;
        font-size: x-large;
        min-height: 36px;
        transition: min-height 0.5s ease-in-out;
      }
      .lyric-container.active {
        display: block;
      }
      .lyric-container li {
        display: none;
      }
      .lyric-container li.active {
        display: block;
      }
      .lyric-container li.active p {
        display: inline;
        margin: 16px;
      }
      .lyric-container.fullscreen {
        min-height: 90vh;
      }
      .lyric-container.fullscreen li {
        display: block;
        margin-top: 8px;
      }
      .lyric-container.fullscreen li p {
        display: block;
        margin: 0;
      }
      .toggle-lyrics.active {
        color: #FFF;
      }
      .lyric-list {
        max-height: var(--ytmusic-player-bar-height);
        transition: max-height 0.5s ease-in-out;
      }
      .lyric-container.fullscreen .lyric-list {
        list-style-type: none;
        max-height: 90vh !important;
        overflow-y: scroll !important;
      }
      .lyric-container.fullscreen .lyric-list::-webkit-scrollbar {
        display: none;
      }
      .lyric-container.fullscreen .lyric-list li {
        color: rgba(255, 255, 255, 0.7);
        transition: color 0.2s ease-in-out;
        transition: font-size 0.2s ease-in-out;
      }
      .lyric-container.fullscreen .lyric-list li.lyric.active {
        color: white;
        font-size: larger;
      }
    </style>
  `);

  document.head.appendChild(style);

  return style as HTMLElement;
}

export function createLyricButtonElement(
  listeners: { [key: string]: EventListenerOrEventListenerObject } = {}
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

  for (const [eventName, callback] of Object.entries(listeners)) {
    lyricButton.addEventListener(eventName, callback);
  }

  controlsButtons.insertBefore(lyricButton, controlsButtons.childNodes[2]);

  return lyricButton as HTMLElement;
}

export function createContainerElement(
  listeners: { [key: string]: EventListenerOrEventListenerObject } = {}
) {
  const playerBar = document.querySelector("ytmusic-player-bar") as HTMLElement;
  playerBar.style.height = "auto";
  playerBar.style.minHeight = "var(--ytmusic-player-bar-height)";
  playerBar.style.width = "100vw";

  const lyricContainer = html(`
    <div 
      class="lyric-container style-scope ytmusic-player-bar"
    ></div>
  `);

  for (const [eventName, callback] of Object.entries(listeners)) {
    lyricContainer.addEventListener(eventName, callback);
  }

  playerBar.appendChild(lyricContainer);

  return lyricContainer as HTMLElement;
}

export function renderLyrics(container: HTMLElement, lyrics: Lyric[]) {
  container.innerHTML = "";

  const ul = html(`<ul class="lyric-list"></ul>`);

  if (!lyrics) {
    const li = document.createElement("li");
    li.innerHTML = "<p>No lyrics found</p>";
    li.classList.add("other", "active");
    ul.appendChild(li);
  } else {
    for (const lyric of lyrics) {
      const li = document.createElement("li");
      // add attr time
      li.setAttribute("time", String(lyric.time));

      let lyricText = "";

      if (lyric?.text) {
        lyricText += `<p>${lyric.text}</p>`;
      }
      if (lyric?.translated) {
        lyricText += `<p>${lyric.translated}</p>`;
      }

      li.innerHTML = lyricText;
      if (lyricText === "") {
        li.classList.add("other");
      } else {
        li.classList.add("lyric");
      }
      ul.appendChild(li);
    }
  }

  container.appendChild(ul);
  return ul as HTMLElement;
}
