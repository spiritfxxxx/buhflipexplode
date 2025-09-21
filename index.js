let buhImg = document.getElementById("buh");
let buh = "./index-assets/buh.webp";
let buhFlip = "./index-assets/buhFlip.webp";
let buhFlipExplode = "./index-assets/buhFlipExplode.webp";
let canClick = true;

/* pause buh after flipping/exploding (he is tired) */
function enableClicksAfterDelay() {
  setTimeout(() => { canClick = true; }, 3000);
}

/* flip/explode buh for the gif's specified duration */
function playGif(src, duration) {
  if (!canClick) return;
  canClick = false;
  buhImg.src = src + "?t=" + new Date().getTime();
  setTimeout(() => {
    buhImg.src = buh + "?t=" + new Date().getTime();
    enableClicksAfterDelay();
  }, duration);
}

/* left click to flip, right click to explode */
buhImg.addEventListener("click", () => { playGif(buhFlip, 2970); });
buhImg.addEventListener("contextmenu", (e) => { e.preventDefault(); playGif(buhFlipExplode, 2480); });