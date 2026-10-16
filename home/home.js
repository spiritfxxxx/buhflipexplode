/* ----------------------------------------------------------------------- MAIN PAGE ----------------------------------------------------------------------- */

let menuBarIsOpen = false, canClick = true;
let buh = "../assets/misc/buh.webp";
let buhFlip = "../assets/misc/buhFlip.webp";
let buhFlipExplode = "../assets/misc/buhFlipExplode.webp";
let currNumberFormat, leaksToggle = document.getElementById("lks"), spoilersToggle = document.getElementById("spl");
let buhImg = document.getElementById("buh");

// display main page
function loadPage() {
  loadSaveState();
  changeNumberFormat();
}
window.addEventListener("DOMContentLoaded", () => { loadPage(); });

/* -------------------------------------------------------------------------- BUH -------------------------------------------------------------------------- */

// display flip/explode + pause after (he is tired)
function showBuh(img, time) {
  if (!canClick) return;
  canClick = false;
  let currTime = new Date().getTime();
  buhImg.src = img + "?t=" + currTime;
  setTimeout(() => {
    buhImg.src = buh + "?t=" + (currTime + time);
    setTimeout(() => { canClick = true; }, 3000);
  }, time);
}
buhImg.addEventListener("click", () => { showBuh(buhFlip, 2970); });
buhImg.addEventListener("contextmenu", (e) => { e.preventDefault(); showBuh(buhFlipExplode, 2480); });

/* ----------------------------------------------------------------------- QOL & NAV ----------------------------------------------------------------------- */

// load saved settings/page
function loadSaveState() {
  currNumberFormat = localStorage.getItem("numberFormat") || "period";
  leaksToggle.checked = localStorage.getItem("leaksEnabled") == "true";
  spoilersToggle.checked = localStorage.getItem("spoilersEnabled") == "true";
}

// save current settings/page
function saveState() {
  localStorage.setItem("numberFormat", currNumberFormat);
  localStorage.setItem("leaksEnabled", leaksToggle.checked);
  localStorage.setItem("spoilersEnabled", spoilersToggle.checked);
}

// go to top of page
function jumpToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

// navigation keyboard shortcuts
document.addEventListener("keydown", (e) => {
  e.stopPropagation();
  if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key == "Escape") { e.preventDefault(); toggleMenuBar(); }
  else if (e.key == " ") { e.preventDefault(); }
  else if (e.key == "Enter" && !menuBarIsOpen) { e.preventDefault(); jumpToTop(); }
});

/* ------------------------------------------------------------------------ MENU BAR ------------------------------------------------------------------------ */

// display/hide menu bar
function toggleMenuBar() {
  menuBarIsOpen = !menuBarIsOpen;
  let menuBar = document.getElementById("mb");
  let menuBarOverlay = document.getElementById("mb-over");
  document.body.style.overflow = menuBarIsOpen ? "hidden" : "auto";
  menuBar.style.display = menuBarOverlay.style.display = menuBarIsOpen ? "flex" : "none";
}

// display number format
function showNumberFormat(num) {
  if (currNumberFormat == "period") return num.toLocaleString("de-DE");
  if (currNumberFormat == "comma") return num.toLocaleString("en-US");
  return num;
}

// change number format
function changeNumberFormat(e) {
  if (e) currNumberFormat = e.dataset.format;
  let numFormatExample = document.getElementById("mb-nf-ex");
  let numFormatOptions = document.querySelectorAll(".nf-opt");
  numFormatExample.innerHTML = showNumberFormat(2222222);
  numFormatOptions.forEach(opt => opt.classList.toggle("selected", opt.dataset.format == currNumberFormat));
  saveState();
}

// display/hide leaks/spoilers
leaksToggle.addEventListener("change", () => {
  if (!leaksToggle.checked) spoilersToggle.checked = false;
  saveState();
});
spoilersToggle.addEventListener("change", () => {
  if (spoilersToggle.checked) leaksToggle.checked = true;
  saveState();
});