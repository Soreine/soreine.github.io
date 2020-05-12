function setRevealed(elements, value) {
  elements.forEach((el) => {
    el.setAttribute("data-revealed", value);
  });
}
const links = document.querySelectorAll("[data-reveal]");

links.forEach((link) => {
  const key = link.getAttribute("data-reveal");
  const reveals = document.querySelectorAll(`[data-from="${key}"]`);

  let revealTimeout = null;

  const onEnter = (event) => {
    // event.preventDefault();
    revealTimeout = setTimeout(() => {
      setRevealed([link, ...reveals], "true");
    }, 200);
  };

  const onLeave = (event) => {
    clearTimeout(revealTimeout);
  };

  setRevealed([link, ...reveals], "false");
  link.addEventListener("mouseover", onEnter);
  link.addEventListener("mouseleave", onLeave);
});
