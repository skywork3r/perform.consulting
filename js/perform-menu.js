"use strict";

(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }

    callback();
  }

  function setupNavigationState() {
    var navigations = Array.prototype.slice.call(document.querySelectorAll(".navigation"));

    function normalizePath(url) {
      var link = document.createElement("a");
      link.href = url;
      var path = link.pathname || "/";

      path = path.replace(/\/+$/, "");
      path = path.replace(/\/index(?:\.html?)?$/i, "");
      path = path.replace(/\.html?$/i, "");

      if (!path || path === "/index") {
        return "/";
      }

      return path;
    }

    function syncCurrentNavigationItems() {
      var currentPath = normalizePath(window.location.href);
      document.querySelectorAll(".navigation .navigation-item").forEach(function (item) {
        var isCurrent = normalizePath(item.href) === currentPath;
        item.classList.toggle("w--current", isCurrent);
        item.classList.toggle("sc-mobile-current", isCurrent);
        if (isCurrent) {
          item.setAttribute("aria-current", "page");
        } else {
          item.removeAttribute("aria-current");
        }
      });
    }

    navigations.forEach(function (navigation) {
      var sourceLogo = navigation.querySelector(".logo-link");
      var menuItems = navigation.querySelector(".navigation-items");
      if (!sourceLogo || !menuItems || menuItems.querySelector(".mobile-menu-logo-link")) {
        return;
      }

      var menuLogo = sourceLogo.cloneNode(true);
      menuLogo.className = "mobile-menu-logo-link w-inline-block";
      menuLogo.setAttribute("aria-label", "Home");
      menuLogo.removeAttribute("aria-current");
      Array.prototype.slice.call(menuLogo.querySelectorAll("[id]")).forEach(function (item) {
        item.removeAttribute("id");
      });
      menuItems.insertBefore(menuLogo, menuItems.firstChild);
    });

    syncCurrentNavigationItems();

    var buttons = Array.prototype.slice.call(document.querySelectorAll(".navigation .menu-button"));
    if (!buttons.length) {
      return;
    }

    function sync() {
      var openButton = document.querySelector(".navigation .menu-button.w--open");
      var isOpen = Boolean(openButton);
      document.body.classList.toggle("sc-menu-open", isOpen);
      buttons.forEach(function (button) {
        button.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      });
      syncCurrentNavigationItems();
    }

    buttons.forEach(function (button) {
      var observer = new MutationObserver(sync);
      observer.observe(button, { attributes: true, attributeFilter: ["class", "aria-expanded"] });
      button.addEventListener("click", function () {
        window.setTimeout(sync, 0);
      });
    });

    document.addEventListener("keydown", function () {
      window.setTimeout(sync, 0);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1024) {
        var openButton = document.querySelector(".navigation .menu-button.w--open");
        if (openButton) {
          openButton.click();
        }
      }
      window.setTimeout(sync, 50);
    });

    document.addEventListener("click", function (event) {
      var item = event.target.closest('.navigation-items[data-nav-menu-open] [aria-current="page"]');
      if (item) {
        event.preventDefault();
      }
    });

    sync();
  }

  function setupVisualViewportNavigation() {
    var navigation = document.querySelector(".navigation.w-nav");
    var visualViewport = window.visualViewport;
    var desktopQuery = window.matchMedia ? window.matchMedia("(min-width: 1025px)") : null;
    var animationFrame = 0;

    if (!navigation || !visualViewport || !desktopQuery) {
      return;
    }

    function sync() {
      var hasVerticalOffset = Math.abs(visualViewport.offsetTop) > 0.5;
      var shouldShift = desktopQuery.matches && hasVerticalOffset;

      animationFrame = 0;

      if (!shouldShift) {
        navigation.classList.remove("pc-vv-shift");
        navigation.style.removeProperty("--pc-vv-top");
        return;
      }

      navigation.style.setProperty("--pc-vv-top", visualViewport.offsetTop + "px");
      navigation.classList.add("pc-vv-shift");
    }

    function scheduleSync() {
      if (animationFrame) {
        return;
      }

      animationFrame = window.requestAnimationFrame(sync);
    }

    visualViewport.addEventListener("resize", scheduleSync);
    visualViewport.addEventListener("scroll", scheduleSync);
    window.addEventListener("resize", scheduleSync);

    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener("change", scheduleSync);
    } else if (desktopQuery.addListener) {
      desktopQuery.addListener(scheduleSync);
    }

    sync();
  }

  ready(function () {
    setupNavigationState();
    setupVisualViewportNavigation();
  });
})();
