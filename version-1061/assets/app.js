(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var navLinks = document.querySelector("[data-nav-links]");

    if (menuButton && navLinks) {
        menuButton.addEventListener("click", function () {
            navLinks.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === activeSlide);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        window.clearInterval(heroTimer);
        heroTimer = window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
            startHero();
        });
    });

    showSlide(0);
    startHero();

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
    var searchPanel = document.querySelector("[data-search-panel]");
    var movies = Array.isArray(window.__MOVIES__) ? window.__MOVIES__ : [];

    function normalizeText(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function searchMovies(query) {
        var normalized = normalizeText(query);
        if (!normalized) {
            return [];
        }
        return movies.filter(function (movie) {
            var haystack = normalizeText([
                movie.title,
                movie.region,
                movie.year,
                movie.type,
                movie.genre,
                movie.tags
            ].join(" "));
            return haystack.indexOf(normalized) !== -1;
        }).slice(0, 12);
    }

    function renderSearchResults(results) {
        if (!searchPanel) {
            return;
        }
        if (!results.length) {
            searchPanel.innerHTML = '<div class="search-result"><span></span><span><strong>暂无匹配影片</strong><small>换个关键词试试</small></span></div>';
            searchPanel.classList.add("is-open");
            return;
        }
        searchPanel.innerHTML = results.map(function (movie) {
            return '<a class="search-result" href="' + movie.url + '">' +
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">' +
                '<span><strong>' + escapeHtml(movie.title) + '</strong><small>' + escapeHtml(movie.region + ' · ' + movie.year + ' · ' + movie.type) + '</small></span>' +
                '</a>';
        }).join("");
        searchPanel.classList.add("is-open");
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[character];
        });
    }

    searchInputs.forEach(function (input) {
        input.addEventListener("input", function () {
            var results = searchMovies(input.value);
            if (!input.value.trim()) {
                if (searchPanel) {
                    searchPanel.classList.remove("is-open");
                    searchPanel.innerHTML = "";
                }
                return;
            }
            renderSearchResults(results);
        });
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                var first = searchMovies(input.value)[0];
                if (first) {
                    window.location.href = first.url;
                }
            }
        });
    });

    document.addEventListener("click", function (event) {
        if (!event.target.closest(".search-box") && searchPanel) {
            searchPanel.classList.remove("is-open");
        }
    });

    var filterInput = document.querySelector("[data-filter-input]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var emptyFilter = document.querySelector("[data-empty-filter]");

    function applyCardFilter() {
        var text = normalizeText(filterInput ? filterInput.value : "");
        var year = yearFilter ? yearFilter.value : "";
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalizeText([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags")
            ].join(" "));
            var matchText = !text || haystack.indexOf(text) !== -1;
            var matchYear = !year || card.getAttribute("data-year") === year;
            var show = matchText && matchYear;
            card.style.display = show ? "" : "none";
            if (show) {
                visible += 1;
            }
        });

        if (emptyFilter) {
            emptyFilter.classList.toggle("is-visible", visible === 0);
        }
    }

    if (filterInput) {
        filterInput.addEventListener("input", applyCardFilter);
    }
    if (yearFilter) {
        yearFilter.addEventListener("change", applyCardFilter);
    }
})();
