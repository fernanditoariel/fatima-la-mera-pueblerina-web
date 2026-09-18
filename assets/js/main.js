(function () {
  "use strict";

  var nav = document.getElementById("nav");
  var navLinks = document.getElementById("nav-links");
  var navToggle = document.getElementById("nav-toggle");

  // Sticky nav shadow state, driven by IntersectionObserver (no scroll listener).
  var sentinel = document.createElement("div");
  sentinel.style.position = "absolute";
  sentinel.style.top = "0";
  sentinel.style.height = "1px";
  sentinel.style.width = "1px";
  document.body.prepend(sentinel);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        nav.classList.toggle("is-scrolled", !entry.isIntersecting);
      });
    }).observe(sentinel);
  }

  // Mobile nav toggle.
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.innerHTML = open
        ? '<i class="ph ph-x" aria-hidden="true"></i>'
        : '<i class="ph ph-list" aria-hidden="true"></i>';
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.innerHTML = '<i class="ph ph-list" aria-hidden="true"></i>';
      });
    });
  }

  // Reveal-on-scroll for elements marked [data-reveal].
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            setTimeout(function () {
              entry.target.classList.add("is-visible");
            }, i * 40);
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // Hero video: alterna los dos clips con fundido cruzado.
  var heroVideos = Array.prototype.slice.call(document.querySelectorAll("[data-hero-video]"));
  var heroToggle = document.getElementById("hero-toggle");
  if (heroVideos.length) {
    var current = 0;
    var paused = false;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var show = function (idx) {
      heroVideos.forEach(function (v, i) {
        v.classList.toggle("is-active", i === idx);
      });
    };
    var next = function () {
      var prev = heroVideos[current];
      current = (current + 1) % heroVideos.length;
      var v = heroVideos[current];
      v.currentTime = 0;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
      show(current);
      setTimeout(function () { if (current !== heroVideos.indexOf(prev)) prev.pause(); }, 1000);
    };
    heroVideos.forEach(function (v, i) {
      v.addEventListener("timeupdate", function () {
        if (i === current && !paused && v.duration && v.duration - v.currentTime < 0.7) {
          if (!v._switching) { v._switching = true; next(); }
        }
      });
      v.addEventListener("seeked", function () { v._switching = false; });
      v.addEventListener("play", function () { v._switching = false; });
    });

    var setPaused = function (state) {
      paused = state;
      if (paused) { heroVideos[current].pause(); } else {
        var p = heroVideos[current].play();
        if (p && p.catch) p.catch(function () {});
      }
      if (heroToggle) {
        heroToggle.setAttribute("aria-pressed", String(paused));
        heroToggle.setAttribute("aria-label", paused ? "Reproducir video de fondo" : "Pausar video de fondo");
        heroToggle.innerHTML = '<i class="ph-fill ph-' + (paused ? "play" : "pause") + '" aria-hidden="true"></i>';
      }
    };
    if (heroToggle) heroToggle.addEventListener("click", function () { setPaused(!paused); });

    if (reduceMotion) { setPaused(true); } else {
      var start = heroVideos[0].play();
      if (start && start.catch) start.catch(function () { setPaused(true); });
    }
  }
})();
