// Bind progress bar events
const { onTimeUpdate, watchBuffered } = (() => {
  const epsilon = 1e-4; // Amplitude does not like 0/100 percentage

  const progressBar = (() => {
    const p = document.getElementById("custom-song-played-progress");
    const played = p.querySelector(".progress-played");
    const buffered = p.querySelector(".progress-buffered");

    return {
      clickArea: p,
      played,
      buffered,
    };
  })();

  let isDragging = false;
  let mousePercentage = epsilon;

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
    mousePercentage = epsilon;
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
      Math.max(epsilon, x / offsetWidth),
      1 - epsilon
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
    main: {
      songs: window.main_songs,
    },
  },
  callbacks: {
    timeupdate: onTimeUpdate,
  },
  // debug: true,
  // preload: true,
});

watchBuffered();
