(function () {
  function attachPlayer(card) {
    var video = card.querySelector('video');
    var button = card.querySelector('.play-layer');
    if (!video || !button) {
      return;
    }

    function loadStream() {
      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }

      if (video.getAttribute('data-ready') === '1') {
        video.play().catch(function () {});
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.setAttribute('data-ready', '1');
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hls = hls;
        video.setAttribute('data-ready', '1');
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = stream;
      video.setAttribute('data-ready', '1');
      video.play().catch(function () {});
    }

    function play() {
      button.classList.add('is-hidden');
      loadStream();
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      button.classList.remove('is-hidden');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.player-card')).forEach(attachPlayer);
  });
})();
