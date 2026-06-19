(function () {
  var nav = document.querySelector('.main-nav');
  var toggle = document.querySelector('.menu-toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var normalize = function (value) {
    return String(value || '').toLowerCase().trim();
  };

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-card-search]');
    var year = scope.querySelector('[data-year-filter]');
    var list = scope.parentElement.querySelector('[data-card-list]') || document.querySelector('[data-card-list]');
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var run = function () {
      var q = normalize(input && input.value);
      var y = year && year.value;
      cards.forEach(function (card) {
        var text = normalize(card.textContent + ' ' + card.dataset.title + ' ' + card.dataset.region + ' ' + card.dataset.genre + ' ' + card.dataset.year);
        var okQuery = !q || text.indexOf(q) !== -1;
        var okYear = !y || card.dataset.year === y;
        card.classList.toggle('is-hidden', !(okQuery && okYear));
      });
    };
    if (input) {
      input.addEventListener('input', run);
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');
      if (initial) {
        input.value = initial;
      }
    }
    if (year) {
      year.addEventListener('change', run);
    }
    run();
  });

  document.querySelectorAll('[data-table-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-table-search]');
    var year = scope.querySelector('[data-year-filter]');
    var list = document.querySelector('[data-table-list]');
    if (!list) {
      return;
    }
    var rows = Array.prototype.slice.call(list.querySelectorAll('tr'));
    var run = function () {
      var q = normalize(input && input.value);
      var y = year && year.value;
      rows.forEach(function (row) {
        var text = normalize(row.textContent + ' ' + row.dataset.title + ' ' + row.dataset.region + ' ' + row.dataset.genre + ' ' + row.dataset.year);
        var okQuery = !q || text.indexOf(q) !== -1;
        var okYear = !y || row.dataset.year === y;
        row.classList.toggle('is-hidden', !(okQuery && okYear));
      });
    };
    if (input) {
      input.addEventListener('input', run);
    }
    if (year) {
      year.addEventListener('change', run);
    }
  });

  var shell = document.querySelector('[data-video-shell]');
  var video = document.getElementById('video-player');
  var button = document.querySelector('[data-play-button]');
  var activeHls = null;

  var loadScript = function (src, done) {
    var existing = document.querySelector('script[src="' + src + '"]');
    if (existing) {
      existing.addEventListener('load', done, { once: true });
      if (window.Hls) {
        done();
      }
      return;
    }
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = done;
    document.head.appendChild(script);
  };

  var startVideo = function () {
    if (!video) {
      return;
    }
    var src = video.getAttribute('data-src');
    if (!src) {
      return;
    }
    var playNow = function () {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
      if (shell) {
        shell.classList.add('playing');
      }
    };
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== src) {
        video.src = src;
      }
      playNow();
      return;
    }
    var attachHls = function () {
      if (window.Hls && window.Hls.isSupported()) {
        if (activeHls) {
          activeHls.destroy();
        }
        activeHls = new window.Hls({ enableWorker: true });
        activeHls.loadSource(src);
        activeHls.attachMedia(video);
        activeHls.on(window.Hls.Events.MANIFEST_PARSED, playNow);
      } else {
        video.src = src;
        playNow();
      }
    };
    if (window.Hls) {
      attachHls();
    } else {
      loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest', attachHls);
    }
  };

  if (button) {
    button.addEventListener('click', startVideo);
  }
  if (shell) {
    shell.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      startVideo();
    });
  }
})();
