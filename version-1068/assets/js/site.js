(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initMobileMenu() {
    var toggle = $('[data-mobile-toggle]');
    var panel = $('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = $('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSearchForms() {
    $all('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';

        if (!query) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function initCatalogFilters() {
    var panel = $('[data-filter-panel]');
    var grid = $('[data-card-grid]');

    if (!panel || !grid) {
      return;
    }

    var searchInput = $('[data-card-search]', panel);
    var yearSelect = $('[data-filter-year]', panel);
    var regionSelect = $('[data-filter-region]', panel);
    var typeSelect = $('[data-filter-type]', panel);
    var resetButton = $('[data-filter-reset]', panel);
    var count = $('[data-filter-count]');
    var items = $all('.catalog-item', grid);

    function matches(item) {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var searchText = item.getAttribute('data-search') || '';

      if (query && searchText.indexOf(query) === -1) {
        return false;
      }

      if (year && item.getAttribute('data-year') !== year) {
        return false;
      }

      if (region && item.getAttribute('data-region') !== region) {
        return false;
      }

      if (type && item.getAttribute('data-type') !== type) {
        return false;
      }

      return true;
    }

    function applyFilters() {
      var visible = 0;

      items.forEach(function (item) {
        var shouldShow = matches(item);
        item.classList.toggle('is-hidden', !shouldShow);

        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部内容';
      }
    }

    [searchInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (!control) {
        return;
      }

      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        applyFilters();
      });
    }

    applyFilters();
  }

  function buildSearchCard(item) {
    var tags = (item.tags || [])
      .slice(0, 3)
      .map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      })
      .join('');

    return [
      '<article class="movie-card compact-card">',
      '  <a class="poster-link" href="' + escapeHtml(item.url) + '" aria-label="观看' + escapeHtml(item.title) + '">',
      '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '封面" loading="lazy">',
      '    <span class="type-badge">' + escapeHtml(item.type) + '</span>',
      '    <span class="poster-play" aria-hidden="true">▶</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a class="movie-title" href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(item.year) + '</span>',
      '      <span>' + escapeHtml(item.region) + '</span>',
      '    </div>',
      '    <p>' + escapeHtml(item.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function initSearchPage() {
    var results = $('[data-search-results]');

    if (!results || !window.MovieSearchData) {
      return;
    }

    var input = $('[data-search-page-input]');
    var button = $('[data-search-page-button]');
    var summary = $('[data-search-page-summary]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function render() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var items = window.MovieSearchData;
      var matched = query
        ? items.filter(function (item) {
            return item.search.indexOf(query) !== -1;
          })
        : items.slice(0, 60);

      results.innerHTML = matched.slice(0, 120).map(buildSearchCard).join('\n');

      if (summary) {
        if (query) {
          summary.textContent = '找到 ' + matched.length + ' 条结果，当前展示前 ' + Math.min(matched.length, 120) + ' 条。';
        } else {
          summary.textContent = '未输入关键词，默认展示前 60 部影片。';
        }
      }
    }

    if (button) {
      button.addEventListener('click', render);
    }

    if (input) {
      input.addEventListener('input', render);
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          render();
        }
      });
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initSearchForms();
    initCatalogFilters();
    initSearchPage();
  });
})();
