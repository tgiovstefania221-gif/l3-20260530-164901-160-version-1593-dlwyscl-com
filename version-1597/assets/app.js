(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
      });
    });
  }

  function setupHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function setActive(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        setActive(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setActive(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        setActive(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        setActive(index + 1);
        play();
      });
    }
    play();
  }

  function setupFilters() {
    var scope = qs('[data-filter-scope]');
    var input = qs('[data-filter-input]');
    var yearSelect = qs('[data-year-filter]');
    var status = qs('[data-filter-status]');
    if (!scope || !input) {
      return;
    }
    var items = qsa('.filter-item', scope);

    function matchesYear(item, yearValue) {
      if (!yearValue) {
        return true;
      }
      var itemYear = item.getAttribute('data-year') || '';
      if (yearValue.length === 4 && yearValue.endsWith('0')) {
        var start = Number(yearValue);
        var current = Number(itemYear);
        return current >= start && current <= start + 9;
      }
      return itemYear === yearValue;
    }

    function apply() {
      var query = normalize(input.value);
      var yearValue = yearSelect ? yearSelect.value : '';
      var visible = 0;
      items.forEach(function (item) {
        var text = normalize([
          item.getAttribute('data-title'),
          item.getAttribute('data-region'),
          item.getAttribute('data-tags'),
          item.getAttribute('data-category')
        ].join(' '));
        var ok = (!query || text.indexOf(query) !== -1) && matchesYear(item, yearValue);
        item.classList.toggle('is-filter-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (status) {
        status.textContent = query || yearValue ? '匹配 ' + visible + ' 部内容' : '浏览精选内容';
      }
    }

    input.addEventListener('input', apply);
    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card filter-item">',
      '<a class="poster-wrap" href="' + escapeHtml(movie.file) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<a class="movie-card-title" href="' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a>',
      '<p>' + escapeHtml(movie.line) + '</p>',
      '<div class="movie-card-tags">' + tags + '</div>',
      '<div class="movie-card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearchPage() {
    var results = qs('[data-search-page-results]');
    var input = qs('[data-search-page-input]');
    var year = qs('[data-search-page-year]');
    var status = qs('[data-search-page-status]');
    var data = window.SITE_SEARCH_INDEX || [];
    if (!results || !input || !data.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function render() {
      var query = normalize(input.value);
      var yearValue = year ? year.value : '';
      var matched = data.filter(function (movie) {
        var text = normalize([movie.title, movie.region, movie.year, movie.type, movie.category, (movie.tags || []).join(' ')].join(' '));
        return (!query || text.indexOf(query) !== -1) && (!yearValue || movie.year === yearValue);
      }).slice(0, 72);
      if (query || yearValue) {
        results.innerHTML = matched.map(cardTemplate).join('');
        if (status) {
          status.textContent = matched.length ? '匹配 ' + matched.length + ' 部内容' : '暂无匹配内容';
        }
      }
    }

    input.addEventListener('input', render);
    if (year) {
      year.addEventListener('change', render);
    }
    render();
  }

  function setupPlayers() {
    var shell = qs('[data-player]');
    if (!shell) {
      return;
    }
    var video = qs('[data-player-video]', shell);
    var overlay = qs('[data-player-overlay]', shell);
    var configNode = qs('#video-config');
    if (!video || !overlay || !configNode) {
      return;
    }
    var source = '';
    try {
      source = JSON.parse(configNode.textContent || '{}').src || '';
    } catch (error) {
      source = '';
    }
    if (!source) {
      return;
    }
    var attached = false;
    var hls = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      video.setAttribute('controls', 'controls');
    }

    function start() {
      attach();
      overlay.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        overlay.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
}());
