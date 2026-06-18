(function () {
  function setupNav() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-main-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHeroSlider() {
    const slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });

    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearchForms() {
    const forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        const input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        const value = input.value.trim();
        if (!value) {
          event.preventDefault();
          input.focus();
        }
      });
    });
  }

  function setupFilters() {
    const cards = Array.from(document.querySelectorAll("[data-filter-card]"));
    if (!cards.length) {
      return;
    }
    const input = document.querySelector("[data-filter-input]");
    const buttons = Array.from(document.querySelectorAll("[data-filter]"));
    const empty = document.querySelector("[data-empty-state]");
    const params = new URLSearchParams(window.location.search);
    let activeType = "all";

    if (input && params.get("q")) {
      input.value = params.get("q") || "";
    }

    function apply() {
      const query = input ? input.value.trim().toLowerCase() : "";
      let visibleCount = 0;
      cards.forEach(function (card) {
        const keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
        const type = card.getAttribute("data-type") || "";
        const matchType = activeType === "all" || type === activeType;
        const matchQuery = !query || keywords.indexOf(query) !== -1;
        const visible = matchType && matchQuery;
        card.classList.toggle("is-hidden", !visible);
        if (visible) {
          visibleCount += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeType = button.getAttribute("data-filter") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        apply();
      });
    });

    if (input) {
      input.addEventListener("input", apply);
    }

    apply();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupNav();
    setupHeroSlider();
    setupSearchForms();
    setupFilters();
  });
})();
