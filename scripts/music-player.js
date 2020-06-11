/* global Amplitude */
const EPSILON = 1e-5; // Amplitude does not like 0/100 percentage
// let playerVisible = false;
let playerInitialized = false; // true at the end of this script

// Bind progress bar events
const { onTimeUpdate, watchBuffered } = (() => {
  const progressBar = (() => {
    const p = document.getElementById("custom-progress-bar");
    const played = p.querySelector(".progress-played");
    const buffered = p.querySelector(".progress-buffered");

    return {
      clickArea: p,
      played,
      buffered,
    };
  })();

  let isDragging = false;
  let mousePercentage = EPSILON;

  function startDragging(e) {
    e.stopPropagation();
    e.preventDefault();
    isDragging = true;
    mousePercentage = getMouseEventPercentage(e);
    updateBar(progressBar.played, mousePercentage);
  }
  function stopDragging() {
    if (isDragging) {
      Amplitude.setSongPlayedPercentage(mousePercentage * 100);
    }
    isDragging = false;
    mousePercentage = EPSILON;
  }

  function mouseMoving(e) {
    requestAnimationFrame(() => {
      if (!isDragging) return;

      mousePercentage = getMouseEventPercentage(e);
      updateBar(progressBar.played, mousePercentage);
    });
  }

  function watchBuffered() {
    window.requestAnimationFrame(() => {
      const percentage = Amplitude.getBuffered() / 100;
      updateBar(progressBar.buffered, percentage);
      watchBuffered();
    });
  }

  function getMouseEventPercentage({ pageX }) {
    const rect = progressBar.clickArea.getBoundingClientRect();
    const offsetLeft = rect.left;
    const offsetWidth = rect.width;
    const x = pageX - offsetLeft;
    const percentage = Math.min(
      Math.max(EPSILON, x / offsetWidth),
      1 - EPSILON
    );
    return percentage;
  }

  function onTimeUpdate() {
    if (isDragging) return;
    const songPlayedPercentage = Amplitude.getSongPlayedPercentage() / 100;
    updateBar(progressBar.played, songPlayedPercentage);
  }

  function updateBar(bar, percentage) {
    bar.style.width = Math.min(Math.max(0, percentage), 1) * 100 + "%";
  }

  progressBar.clickArea.addEventListener("mousedown", startDragging);

  window.addEventListener("mouseup", stopDragging);
  window.addEventListener("mousemove", mouseMoving);

  return { onTimeUpdate, watchBuffered };
})();

// Bind download button
const updateDownloadButton = (() => {
  const download = document.getElementById("download");
  function onSongChange() {
    const song = Amplitude.getActiveSongMetadata();
    download.setAttribute("href", song.url);
  }

  return onSongChange;
})();

const revealPlayer = () => {
  // Reveal player
  document.getElementById("song-player").className = "";
  // playerVisible = true;
};

// Scroll to song on click
const scrollToSong = (force = false) => {
  // Wait for player state to be fully updated
  requestAnimationFrame(() => {
    if (!force) {
      if (Amplitude.getPlayerState() !== "playing") return;
      // Ignore initialization call
      if (!playerInitialized) return;
    }

    const songs = Array.from(document.querySelectorAll(".song"));

    const currentSong = songs.find((song) => {
      const playlist = song
        .querySelector(".title")
        .getAttribute("data-amplitude-playlist");
      const index = song
        .querySelector(".title")
        .getAttribute("data-amplitude-song-index");

      return (
        playlist == Amplitude.getActivePlaylist() &&
        index == Amplitude.getActiveSongMetadata().index
      );
    });

    if (currentSong) {
      currentSong.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  });
};

function updatePageTitle() {
  // Ignore initialization call
  if (!playerInitialized) return;
  const song = Amplitude.getActiveSongMetadata();
  const playlist = Amplitude.getActivePlaylist();
  document.title = song.name;

  setSearchParam({
    playlist,
    track: song.index.toString(),
  });
}

function getSearchParam(key, value) {
  let params = new window.URLSearchParams(window.location.search);
  return params.get(key, value);
}

// https://stackoverflow.com/questions/1090948/change-url-parameters
function setSearchParam(inputParams) {
  let url = new URL(window.location.href);
  let params = new window.URLSearchParams(window.location.search);
  Object.keys(inputParams).forEach((key) => {
    const value = inputParams[key];
    if (value === undefined || value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });

  url.search = params;
  window.history.replaceState({ url: url.toString() }, null, url.toString());
}

// Bind keys
(() => {
  window.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      // HACK: using the methods will not update the interface...
      // So just prevent default, and use the `config.bindings`
      //
      // if (Amplitude.getPlayerState() === "playing") {
      //   Amplitude.pause();
      // } else {
      //   Amplitude.play();
      // }
    } else if (e.key === "ArrowRight") {
      Amplitude.next();
    } else if (e.key === "ArrowLeft") {
      if (Amplitude.getSongPlayedSeconds() < 3) {
        Amplitude.prev();
      } else {
        Amplitude.setSongPlayedPercentage(EPSILON);
      }
    } else {
      return;
    }

    e.stopPropagation();
    e.preventDefault();
  });
})();

Amplitude.init({
  songs: [{}],
  playlists: {
    pieces: {
      songs: window.pieces,
    },
    fragments: {
      songs: window.fragments,
    },
    archived: {
      songs: window.archived,
    },
  },
  callbacks: {
    play: () => {
      revealPlayer();
      updatePageTitle();
    },
    timeupdate: onTimeUpdate,
    song_change: () => {
      updateDownloadButton();
      scrollToSong();
      updatePageTitle();
    },
  },
  bindings: {
    "32": "play_pause",
  },
  autoplay: false,
  // debug: true,
  // preload: true,
});

{
  Amplitude.skipTo(0, 0, "pieces");
  Amplitude.pause();
  Amplitude.setVolume(100);

  watchBuffered();

  playerInitialized = true;

  const playlistName = getSearchParam("playlist");
  const track = getSearchParam("track");
  if (playlistName !== "" && track !== "") {
    Amplitude.skipTo(0, track, playlistName);
    Amplitude.pause();
    setTimeout(() => {
      scrollToSong(true);
      revealPlayer();
      Amplitude.pause();
    }, 200);
  }
}
