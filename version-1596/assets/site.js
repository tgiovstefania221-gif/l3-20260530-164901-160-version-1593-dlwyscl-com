(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    selectAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./search.html";

        if (query) {
          window.location.href = target + "?q=" + encodeURIComponent(query);
        } else {
          window.location.href = target;
        }
      });
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = selectAll(".hero-slide", slider);
    var dots = selectAll("[data-hero-dot]");
    var previous = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function move(step) {
      show(active + step);
    }

    function play() {
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    function reset() {
      if (timer) {
        window.clearInterval(timer);
      }

      play();
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        reset();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        move(-1);
        reset();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        move(1);
        reset();
      });
    }

    if (slides.length > 1) {
      show(0);
      play();
    }
  }

  function setupFilters() {
    selectAll("[data-filter-scope]").forEach(function (scope) {
      var queryInput = scope.querySelector("[data-filter-query]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var typeSelect = scope.querySelector("[data-filter-type]");
      var empty = scope.querySelector("[data-empty-state]");
      var cards = selectAll("[data-movie-card]", scope);
      var params = new URLSearchParams(window.location.search);

      if (queryInput && params.get("q")) {
        queryInput.value = params.get("q");
      }

      function matches(card) {
        var query = normalize(queryInput ? queryInput.value : "");
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-category"),
          card.getAttribute("data-keywords")
        ].join(" "));

        if (query && haystack.indexOf(query) === -1) {
          return false;
        }

        if (year && card.getAttribute("data-year") !== year) {
          return false;
        }

        if (type && card.getAttribute("data-type") !== type) {
          return false;
        }

        return true;
      }

      function filter() {
        var visible = 0;

        cards.forEach(function (card) {
          var isVisible = matches(card);
          card.style.display = isVisible ? "" : "none";

          if (isVisible) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (queryInput) {
        queryInput.addEventListener("input", filter);
      }

      if (yearSelect) {
        yearSelect.addEventListener("change", filter);
      }

      if (typeSelect) {
        typeSelect.addEventListener("change", filter);
      }

      filter();
    });
  }

  window.initMoviePlayer = function (playerId, videoUrl) {
    var root = document.getElementById(playerId);

    if (!root) {
      return;
    }

    var video = root.querySelector("video");
    var overlay = root.querySelector("[data-player-cover]");
    var message = root.querySelector("[data-player-message]");
    var initialized = false;
    var hlsInstance = null;

    function showMessage(text) {
      if (!message) {
        return;
      }

      message.textContent = text;
      message.classList.add("is-visible");
    }

    function attach() {
      if (initialized || !videoUrl || !video) {
        return;
      }

      initialized = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
        root._hlsPlayer = hlsInstance;
        return;
      }

      video.src = videoUrl;
    }

    function start() {
      if (!video) {
        return;
      }

      attach();
      video.controls = true;

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var request = video.play();

      if (request && typeof request.catch === "function") {
        request.catch(function () {
          showMessage("点击视频区域即可继续播放");
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      video.addEventListener("error", function () {
        showMessage("视频暂时无法加载，请稍后重试");
      });
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
  });
})();
