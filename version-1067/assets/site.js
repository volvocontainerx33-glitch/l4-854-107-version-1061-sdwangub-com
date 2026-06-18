(function () {
  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function markMissingImages() {
    document.querySelectorAll("img[data-fallback]").forEach(function (img) {
      img.addEventListener("error", function () {
        var shell = img.closest(".poster-shell");
        if (shell) {
          shell.classList.add("no-image");
        }
        img.style.opacity = "0";
      });
    });
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

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
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

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

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function setupCardFilters() {
    var root = document.querySelector("[data-filter-root]");

    if (!root) {
      return;
    }

    var input = root.querySelector("[data-filter-input]");
    var category = root.querySelector("[data-filter-category]");
    var year = root.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
    var empty = root.querySelector("[data-empty-state]");

    function apply() {
      var keyword = normalize(input && input.value);
      var categoryValue = normalize(category && category.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-category")
        ].join(" "));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchCategory = !categoryValue || normalize(card.getAttribute("data-category")) === categoryValue;
        var matchYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
        var matched = matchKeyword && matchCategory && matchYear;

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var root = document.querySelector("[data-search-page]");

    if (!root || !window.MOVIE_INDEX) {
      return;
    }

    var input = document.getElementById("searchPageInput");
    var category = document.getElementById("searchCategorySelect");
    var results = document.getElementById("searchResults");
    var summary = document.getElementById("searchSummary");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input) {
      input.value = initialQuery;
    }

    function cardTemplate(movie) {
      return [
        '<article class="movie-card grid">',
        '  <a href="' + escapeHtml(movie.url) + '" class="movie-card-link">',
        '    <div class="poster-shell">',
        '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-fallback>',
        '      <span class="image-fallback-title">' + escapeHtml(movie.title) + '</span>',
        '      <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
        '    </div>',
        '    <div class="movie-card-body">',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p>' + escapeHtml(movie.oneLine) + '</p>',
        '      <div class="movie-meta">',
        '        <span>' + escapeHtml(movie.year) + '</span>',
        '        <span>' + escapeHtml(movie.region) + '</span>',
        '        <span>' + escapeHtml(movie.genreMain) + '</span>',
        '      </div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join("");
    }

    function render() {
      var query = normalize(input && input.value);
      var categoryValue = normalize(category && category.value);
      var matched = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.oneLine,
          movie.genre,
          movie.region,
          movie.year,
          movie.category
        ].join(" "));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchCategory = !categoryValue || normalize(movie.category) === categoryValue;
        return matchQuery && matchCategory;
      }).slice(0, 120);

      if (summary) {
        summary.textContent = "共找到 " + matched.length + " 条匹配结果，最多展示前 120 条。";
      }

      if (results) {
        results.innerHTML = matched.map(cardTemplate).join("");
        markMissingImages();
      }
    }

    if (input) {
      input.addEventListener("input", render);
    }

    if (category) {
      category.addEventListener("change", render);
    }

    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    markMissingImages();
    setupMobileMenu();
    setupHero();
    setupCardFilters();
    setupSearchPage();
  });
})();
