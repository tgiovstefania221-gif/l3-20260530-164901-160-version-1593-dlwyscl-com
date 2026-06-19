(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".nav-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector(".hero-prev");
    var next = carousel.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-index")) || 0);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function getCardText(card) {
    return [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-region") || "",
      card.getAttribute("data-year") || "",
      card.getAttribute("data-genre") || "",
      card.getAttribute("data-tags") || "",
      card.textContent || ""
    ].join(" ").toLowerCase();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll(".filter-scope"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector(".search-input");
      var chips = Array.prototype.slice.call(scope.querySelectorAll(".filter-chip"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .ranking-card"));
      var activeFilter = "all";

      function update() {
        var query = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var text = getCardText(card);
          var filterOk = activeFilter === "all" || text.indexOf(activeFilter.toLowerCase()) !== -1;
          var queryOk = !query || text.indexOf(query) !== -1;
          card.classList.toggle("is-filter-hidden", !(filterOk && queryOk));
        });
      }

      if (input) {
        input.addEventListener("input", update);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          activeFilter = chip.getAttribute("data-filter") || "all";
          update();
        });
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
