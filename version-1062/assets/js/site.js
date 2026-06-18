document.addEventListener("DOMContentLoaded", function () {
  var navButton = document.querySelector("[data-nav-toggle]");

  if (navButton) {
    navButton.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
  }

  var nav = document.querySelector("[data-main-nav]");

  if (nav) {
    nav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        document.body.classList.remove("nav-open");
      }
    });
  }
});
