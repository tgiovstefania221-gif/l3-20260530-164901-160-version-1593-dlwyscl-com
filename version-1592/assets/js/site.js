(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function() {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var grid = document.querySelector('[data-filter-grid]');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var localSearch = document.getElementById('localSearch');
    var yearFilter = document.getElementById('yearFilter');
    var typeButtons = Array.prototype.slice.call(document.querySelectorAll('[data-type-filter]'));
    var activeType = 'all';

    function getQueryFromUrl() {
      var params = new URLSearchParams(window.location.search);
      return params.get('q') || '';
    }

    function textOf(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
    }

    function applyFilters() {
      var query = localSearch ? localSearch.value.trim().toLowerCase() : '';
      var selectedYear = yearFilter ? yearFilter.value : 'all';
      cards.forEach(function(card) {
        var text = textOf(card);
        var yearOk = selectedYear === 'all' || card.getAttribute('data-year') === selectedYear;
        var typeOk = activeType === 'all' || card.getAttribute('data-type') === activeType;
        var queryOk = !query || text.indexOf(query) !== -1;
        card.classList.toggle('is-filtered-out', !(yearOk && typeOk && queryOk));
      });
    }

    if (localSearch) {
      localSearch.value = getQueryFromUrl();
      localSearch.addEventListener('input', applyFilters);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilters);
    }

    typeButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        activeType = button.getAttribute('data-type-filter') || 'all';
        typeButtons.forEach(function(item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilters();
      });
    });

    applyFilters();
  }
}());
