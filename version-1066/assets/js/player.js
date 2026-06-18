(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var source = video ? video.querySelector('source') : null;
    var button = shell.querySelector('.play-overlay');
    var hls = null;
    var ready = false;

    if (!video || !source || !button) {
      return;
    }

    function load() {
      var url = source.getAttribute('src');
      if (ready) {
        return;
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function start() {
      load();
      shell.classList.add('is-playing');
      var playback = video.play();
      if (playback && playback.catch) {
        playback.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime < 0.2) {
        shell.classList.remove('is-playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(setupPlayer);
})();
