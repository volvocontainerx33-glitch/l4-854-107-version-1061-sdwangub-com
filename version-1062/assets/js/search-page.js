(function () {
  var data = window.MOVIE_SEARCH_DATA || [];
  var input = document.querySelector("[data-search-input]");
  var clearButton = document.querySelector("[data-search-clear]");
  var results = document.querySelector("[data-search-results]");
  var title = document.querySelector("[data-search-title]");

  if (!input || !results) {
    return;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function buildCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      '<article class="movie-card compact">',
      '  <a class="poster-card" href="movies/' + item.id + '.html" aria-label="查看 ' + escapeHtml(item.title) + '">',
      '    <span class="poster-year">' + escapeHtml(item.year) + '</span>',
      '    <span class="poster-initial">' + escapeHtml(item.title.slice(0, 1) || "?") + '</span>',
      '    <span class="poster-region">' + escapeHtml(item.region) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line">' + escapeHtml(item.type) + ' · ' + escapeHtml(item.genre) + '</div>',
      '    <h3><a href="movies/' + item.id + '.html">' + escapeHtml(item.title) + '</a></h3>',
      '    <p>' + escapeHtml(item.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join("\n");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function render(items, query) {
    var visible = items.slice(0, 80);

    if (title) {
      title.textContent = query ? "搜索结果：" + visible.length + " 条" : "推荐浏览";
    }

    if (!visible.length) {
      results.innerHTML = '<p class="empty-state">没有找到匹配内容，请尝试更换关键词。</p>';
      return;
    }

    results.innerHTML = visible.map(buildCard).join("\n");
  }

  function search() {
    var query = normalize(input.value);

    if (!query) {
      render(data.slice(0, 24), "");
      return;
    }

    var words = query.split(/\s+/).filter(Boolean);
    var found = data.filter(function (item) {
      var haystack = normalize([
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.tags.join(" "),
        item.oneLine
      ].join(" "));

      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    });

    render(found, query);
  }

  clearButton && clearButton.addEventListener("click", function () {
    input.value = "";
    search();
    input.focus();
  });

  input.addEventListener("input", search);

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q");

  if (initialQuery) {
    input.value = initialQuery;
  }

  search();
})();
