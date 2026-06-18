import { H as Hls } from './hls-vendor-dru42stk.js';

function initializePlayer(shell) {
  const video = shell.querySelector('video[data-src]');
  const button = shell.querySelector('[data-play-button]');

  if (!video || !button) {
    return;
  }

  let isReady = false;
  let hls = null;

  async function startPlayback() {
    const source = video.getAttribute('data-src');

    if (!source) {
      return;
    }

    button.classList.add('is-hidden');

    if (!isReady) {
      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        button.classList.remove('is-hidden');
        button.querySelector('strong').textContent = '当前浏览器不支持 HLS';
        return;
      }

      isReady = true;
    }

    try {
      await video.play();
    } catch (error) {
      button.classList.remove('is-hidden');
      button.querySelector('strong').textContent = '再次点击播放';
    }
  }

  button.addEventListener('click', startPlayback);

  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      button.classList.remove('is-hidden');
    }
  });

  video.addEventListener('ended', function () {
    button.classList.remove('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player-shell]').forEach(initializePlayer);
});
