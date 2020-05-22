const EPSILON = 1e-5; // Amplitude does not like 0/100 percentage

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
  function stopDragging(e) {
    if (isDragging) {
      Amplitude.setSongPlayedPercentage(mousePercentage * 100);
    }
    isDragging = false;
    mousePercentage = EPSILON;
  }

  function mouseMoving(e) {
    if (!isDragging) return;

    mousePercentage = getMouseEventPercentage(e);
    updateBar(progressBar.played, mousePercentage);
  }

  function watchBuffered(x = 0) {
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

  return {
    onTimeUpdate,
    watchBuffered,
  };
})();

Amplitude.init({
  songs: window.main_songs,
  playlists: {
    main_songs: {
      songs: window.main_songs,
    },
  },
  callbacks: {
    timeupdate: onTimeUpdate,
  },
  bindings: {
    "32": "play_pause",
  },
  // debug: true,
  // preload: true,
});

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

watchBuffered();
