(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var topbar = document.querySelector(".topbar");
    var toggle = document.querySelector(".nav-toggle");

    if (topbar && toggle) {
      toggle.addEventListener("click", function () {
        topbar.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (query) {
          location.href = "search.html?q=" + encodeURIComponent(query);
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    if (slides.length > 1) {
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          showSlide(i);
        });
      });
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    document.querySelectorAll(".page-filter").forEach(function (input) {
      var grid = input.closest("section").querySelector(".catalog-grid");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = ((card.dataset.title || "") + " " + (card.dataset.keywords || "")).toLowerCase();
          card.classList.toggle("is-filtered-out", query && haystack.indexOf(query) === -1);
        });
      });
    });

    var searchBox = document.getElementById("searchInput");
    var results = document.getElementById("searchResults");
    var localForm = document.querySelector("[data-local-search]");

    function getParam(name) {
      var params = new URLSearchParams(location.search);
      return params.get(name) || "";
    }

    function renderSearch(query) {
      if (!results || !window.MOVIES_INDEX) {
        return;
      }
      var q = query.trim().toLowerCase();
      var list = window.MOVIES_INDEX.filter(function (item) {
        return !q || item.k.toLowerCase().indexOf(q) !== -1;
      }).slice(0, 120);
      if (!list.length) {
        results.innerHTML = '<div class="article-card"><h2>没有找到匹配影片</h2><p>可以换一个片名、年份、地区或题材关键词继续搜索。</p></div>';
        return;
      }
      results.innerHTML = list.map(function (item) {
        return '<article class="search-item">' +
          '<a href="' + item.u + '"><img src="' + item.c + '" alt="' + escapeHtml(item.t) + '" loading="lazy"></a>' +
          '<div><h2><a href="' + item.u + '">' + escapeHtml(item.t) + '</a></h2>' +
          '<p>' + escapeHtml(item.d) + '</p>' +
          '<div class="card-meta"><span>' + escapeHtml(item.y) + '</span><span>' + escapeHtml(item.r) + '</span><span>' + escapeHtml(item.g) + '</span></div></div>' +
          '</article>';
      }).join("");
    }

    function escapeHtml(text) {
      return String(text || "").replace(/[&<>"']/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;",
          "'": "&#39;"
        }[char];
      });
    }

    if (searchBox && results) {
      var initial = getParam("q");
      searchBox.value = initial;
      renderSearch(initial);
      if (localForm) {
        localForm.addEventListener("submit", function (event) {
          event.preventDefault();
          var q = searchBox.value.trim();
          history.replaceState(null, "", q ? "search.html?q=" + encodeURIComponent(q) : "search.html");
          renderSearch(q);
        });
      }
      searchBox.addEventListener("input", function () {
        renderSearch(searchBox.value);
      });
    }
  });
})();
