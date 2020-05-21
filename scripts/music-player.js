// Bind progress bar mouse events
const { onTimeUpdate } = (() => {
  const epsilon = 1e-4; // Amplitude does not like 0/100 percentage

  const progressBar = (() => {
    const p = document.getElementById("custom-song-played-progress");
    const played = p.querySelector(".progress-played");

    return {
      clickArea: p,
      played,
    };
  })();

  let isDragging = false;
  let mousePercentage = epsilon;

  function startDragging(e) {
    e.stopPropagation();
    e.preventDefault();
    isDragging = true;
    mousePercentage = getMouseEventPercentage(e);
    updateProgressBarPercentage(mousePercentage);
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
    updateProgressBarPercentage(mousePercentage);
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
    updateProgressBarPercentage(songPlayedPercentage);
  }

  function updateProgressBarPercentage(percentage) {
    progressBar.played.style.width = percentage * 100 + "%";
  }

  progressBar.clickArea.addEventListener("mousedown", startDragging);

  window.addEventListener("mouseup", stopDragging);
  window.addEventListener("mousemove", mouseMoving);

  return {
    onTimeUpdate,
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
