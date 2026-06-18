(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var select = panel.querySelector("[data-filter-select]");
            var scope = document.querySelector(panel.getAttribute("data-filter-panel")) || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
            var empty = document.querySelector(panel.getAttribute("data-empty-target"));
            function apply() {
                var q = input ? input.value.trim().toLowerCase() : "";
                var s = select ? select.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-filter-text") || "").toLowerCase();
                    var matchText = !q || text.indexOf(q) !== -1;
                    var matchSelect = !s || text.indexOf(s) !== -1;
                    var show = matchText && matchSelect;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            if (input) {
                input.addEventListener("input", apply);
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    input.value = q;
                }
            }
            if (select) {
                select.addEventListener("change", apply);
            }
            apply();
        });
    }

    window.initMoviePlayer = function (settings) {
        var video = document.getElementById(settings.videoId);
        var overlay = document.getElementById(settings.overlayId);
        if (!video || !overlay || !settings.source) {
            return;
        }
        function load() {
            if (!video.getAttribute("data-ready")) {
                var Hls = window.Hls;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = settings.source;
                } else if (Hls && Hls.isSupported()) {
                    var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(settings.source);
                    hls.attachMedia(video);
                    video._hls = hls;
                } else {
                    video.src = settings.source;
                }
                video.setAttribute("data-ready", "1");
            }
        }
        function play() {
            load();
            overlay.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }
        overlay.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
