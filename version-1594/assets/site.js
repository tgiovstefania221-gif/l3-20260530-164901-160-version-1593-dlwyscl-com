(function () {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var nextButton = document.querySelector('[data-hero-next]');
  var prevButton = document.querySelector('[data-hero-prev]');
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === activeIndex);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === activeIndex);
    });
  }

  function startHero() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5000);
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      showSlide(activeIndex + 1);
      startHero();
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      showSlide(activeIndex - 1);
      startHero();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var filterInput = document.querySelector('[data-filter-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

  function filterCards(query) {
    var normalized = query.trim().toLowerCase();

    cards.forEach(function (card) {
      var content = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-meta') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();

      card.classList.toggle('hidden-card', normalized && content.indexOf(normalized) === -1);
    });
  }

  if (filterInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (initialQuery) {
      filterInput.value = initialQuery;
      filterCards(initialQuery);
    }

    filterInput.addEventListener('input', function () {
      filterCards(filterInput.value);
    });
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var ready = false;
    var hls = null;

    function requestPlay() {
      var promise = video.play();

      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    function prepare() {
      if (ready) {
        requestPlay();
        return;
      }

      ready = true;
      video.setAttribute('controls', 'controls');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        requestPlay();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          requestPlay();
        });
        return;
      }

      video.src = stream;
      requestPlay();
    }

    function start() {
      if (button) {
        button.classList.add('is-hidden');
      }

      prepare();
    }

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
