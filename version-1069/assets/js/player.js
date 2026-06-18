(function () {
  function initPlayer(wrap) {
    var video = wrap.querySelector("video");
    var button = wrap.querySelector(".play-mask");
    if (!video || !button) {
      return;
    }
    var stream = button.getAttribute("data-stream");
    var loaded = false;

    function bind() {
      if (loaded || !stream) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.hlsController = hls;
      } else {
        video.src = stream;
      }
      loaded = true;
    }

    function play() {
      bind();
      button.classList.add("is-hidden");
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        play();
      }
    });
  }

  document.querySelectorAll(".player-wrap").forEach(initPlayer);
})();
