import { H as Hls } from "./hls-vendor-dru42stk.js";

function setupPlayer(root) {
  var video = root.querySelector("[data-video]");
  var button = root.querySelector("[data-play-button]");
  var source = root.getAttribute("data-m3u8");
  var ready = false;

  if (!video || !button || !source) {
    return;
  }

  function showError(message) {
    button.classList.remove("is-hidden");
    button.innerHTML = "<strong>播放初始化失败</strong><em>" + message + "</em>";
  }

  function start() {
    if (ready) {
      video.play().catch(function () {});
      button.classList.add("is-hidden");
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      ready = true;
      video.play().catch(function () {});
      button.classList.add("is-hidden");
      return;
    }

    if (Hls && Hls.isSupported && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        ready = true;
        video.play().catch(function () {});
        button.classList.add("is-hidden");
      });

      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          showError("请检查播放源或网络环境后重试。 ");
        }
      });

      return;
    }

    showError("当前浏览器暂不支持 HLS 播放。 ");
  }

  button.addEventListener("click", start);
  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-player]").forEach(setupPlayer);
});
