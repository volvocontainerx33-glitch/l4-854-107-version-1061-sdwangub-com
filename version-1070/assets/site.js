(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs('.mobile-toggle');
  var panel = qs('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.textContent = isOpen ? '×' : '☰';
    });
  }

  qsa('[data-hero]').forEach(function (hero) {
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var prev = qs('.hero-prev', hero);
    var next = qs('.hero-next', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  qsa('[data-filter-panel]').forEach(function (panelNode) {
    var input = qs('[data-filter-input]', panelNode);
    var category = qs('[data-category-select]', panelNode);
    var year = qs('[data-year-select]', panelNode);
    var grid = qs('[data-card-grid]') || panelNode.parentElement.querySelector('[data-card-grid]');
    var empty = qs('[data-empty]') || panelNode.parentElement.querySelector('[data-empty]');
    var cards = grid ? qsa('.movie-card', grid) : [];
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function filter() {
      var text = input ? input.value.trim().toLowerCase() : '';
      var selectedCategory = category ? category.value : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var cardCategory = card.getAttribute('data-category') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matchText = !text || haystack.indexOf(text) !== -1;
        var matchCategory = !selectedCategory || cardCategory === selectedCategory;
        var matchYear = !selectedYear || cardYear.indexOf(selectedYear) !== -1;
        var showCard = matchText && matchCategory && matchYear;
        card.hidden = !showCard;
        if (showCard) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', filter);
    }
    if (category) {
      category.addEventListener('change', filter);
    }
    if (year) {
      year.addEventListener('change', filter);
    }
    filter();
  });
})();
