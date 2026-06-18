(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');

  if (toggle && header) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var index = 0;
  var timer = null;

  function showSlide(next) {
    if (!slides.length) {
      return;
    }
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function startCarousel() {
    if (slides.length < 2) {
      return;
    }
    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      startCarousel();
    });
  });

  startCarousel();

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function getQueryValue(name) {
    try {
      return new URLSearchParams(window.location.search).get(name) || '';
    } catch (error) {
      return '';
    }
  }

  function setupFiltering() {
    var input = document.querySelector('#site-search-input') || document.querySelector('.page-filter');
    var regionSelect = document.querySelector('#region-filter');
    var yearSelect = document.querySelector('#year-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var empty = document.querySelector('.empty-state');

    if (!input || !cards.length) {
      return;
    }

    var query = getQueryValue('q');
    if (query) {
      input.value = query;
    }

    function filterCards() {
      var term = normalize(input.value);
      var region = normalize(regionSelect ? regionSelect.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchesTerm = !term || haystack.indexOf(term) !== -1;
        var matchesRegion = !region || normalize(card.getAttribute('data-region')).indexOf(region) !== -1;
        var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
        var visible = matchesTerm && matchesRegion && matchesYear;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    input.addEventListener('input', filterCards);
    if (regionSelect) {
      regionSelect.addEventListener('change', filterCards);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', filterCards);
    }
    filterCards();
  }

  setupFiltering();
})();
