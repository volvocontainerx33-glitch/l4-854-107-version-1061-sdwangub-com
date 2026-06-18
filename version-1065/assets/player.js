const configElement = document.getElementById("player-config");
const video = document.getElementById("movie-player");
const mask = document.getElementById("play-mask");
let playerConfig = null;
let hlsPromise = null;
let isReady = false;
let hlsInstance = null;

if (configElement && video && mask) {
  playerConfig = JSON.parse(configElement.textContent);
  video.poster = playerConfig.poster;
  mask.addEventListener("click", startPlayback);
  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });
  video.addEventListener("play", function () {
    mask.classList.add("is-hidden");
  });
}

function loadHlsLibrary() {
  if (window.Hls) {
    return Promise.resolve(window.Hls);
  }
  if (hlsPromise) {
    return hlsPromise;
  }
  hlsPromise = new Promise(function (resolve, reject) {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
    script.async = true;
    script.onload = function () {
      resolve(window.Hls);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return hlsPromise;
}

async function prepareVideo() {
  if (isReady || !playerConfig || !video) {
    return;
  }
  const source = playerConfig.url;
  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
    isReady = true;
    return;
  }
  const Hls = await loadHlsLibrary();
  if (Hls && Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);
    isReady = true;
    return;
  }
  video.src = source;
  isReady = true;
}

async function startPlayback() {
  if (!video || !mask) {
    return;
  }
  mask.classList.add("is-hidden");
  try {
    await prepareVideo();
    await video.play();
  } catch (error) {
    mask.classList.remove("is-hidden");
  }
}

window.addEventListener("beforeunload", function () {
  if (hlsInstance) {
    hlsInstance.destroy();
  }
});
