let buhImg = document.getElementById("gif");
let buh = "/home-assets/buh.webp";
let buhFlip = "/home-assets/buhFlip.webp";
let buhFlipExplode = "/home-assets/buhFlipExplode.webp"; 
let isPlaying = false;
let canClick = true;

/* pause buh after flipping/exploding (he is tired) */
function enableClicksAfterDelay() {
  canClick = false;
  setTimeout(() => { 
    canClick = true;
  }, 3000);
}

/* flip/explode buh for the gif's specified duration */
function playGif(gifSrc, duration) {
  if (isPlaying || !canClick) return;
  isPlaying = true;
  buhImg.src = gifSrc + "?t=" + new Date().getTime();
  setTimeout(() => {
    buhImg.src = buh;
    buhImg.src = buh + "?t=" + new Date().getTime();
    enableClicksAfterDelay();
    isPlaying = false;
  }, duration);
}

/* left click to flip, right click to explode */
buhImg.addEventListener("click", () => {
  playGif(buhFlip, 2970);
});
buhImg.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  playGif(buhFlipExplode, 2480);
});