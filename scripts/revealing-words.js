function setRevealed(elements, value) {
  elements.forEach((el) => {
    el.setAttribute("data-revealed", value);
  });
}
const links = document.querySelectorAll("[data-reveal]");

links.forEach((link) => {
  const key = link.getAttribute("data-reveal");
  const memo = link.hasAttribute("data-memo");
  const reveals = document.querySelectorAll('[data-from="' + key + '"]');

  let revealTimeout = null;

  const reveal = () => {
    if (memo) {
      localStorage.setItem("revealed" + key, true);
    }
    setRevealed([link, ...reveals], "true");
  };

  const onEnter = (event) => {
    revealTimeout = setTimeout(reveal, 200);
  };

  const onLeave = (event) => {
    clearTimeout(revealTimeout);
  };

  if (memo) {
    const wasRevealed = localStorage.getItem("revealed" + key);
    if (wasRevealed) return;
  }

  setRevealed([link, ...reveals], "false");
  link.addEventListener("mouseover", onEnter);
  link.addEventListener("mouseleave", onLeave);
});
