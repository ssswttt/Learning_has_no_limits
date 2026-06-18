/**
 * 学无涯 - 全局模块导航 + 长辈模式
 * 从任意子目录正确跳转到五大模块入口
 */
(function (global) {
  var ELDER_KEY = "elderMode";

  function isElderMode() {
    return localStorage.getItem(ELDER_KEY) === "true";
  }

  function applyElderMode() {
    document.body.classList.toggle("elder", isElderMode());
  }

  function toggleElderMode() {
    var next = !isElderMode();
    localStorage.setItem(ELDER_KEY, next);
    applyElderMode();
    return next;
  }

  global.XueWuyaElderMode = {
    isEnabled: isElderMode,
    apply: applyElderMode,
    toggle: toggleElderMode,
  };

  const MODULES = {
    baixiaotang: "baixiaotang.html",
    wanhua: "wht/index.html",
    gongxuetang: "index.html",
    chuanjia: "chuanjialu/pages/memoir/home.html",
    ziliudi: "home.html",
  };

  function getAppRoot() {
    const script = document.querySelector('script[src*="nav.js"]');
    if (script && script.src) {
      const url = new URL(script.src, window.location.href);
      return url.href.replace(/js\/nav\.js(\?.*)?$/, "");
    }
    return new URL("./", window.location.href).href;
  }

  function go(module) {
    const path = MODULES[module];
    if (!path) return;
    window.location.href = getAppRoot() + path;
  }

  function initBottomNav(activeModule) {
    document.querySelectorAll("[data-nav-module]").forEach(function (el) {
      var mod = el.getAttribute("data-nav-module");
      var isActive = mod === activeModule;
      el.classList.toggle("active", isActive);
      el.classList.toggle("nav-item--active", isActive);
      el.setAttribute("aria-current", isActive ? "page" : "false");
      el.style.cursor = "pointer";
      if (el.dataset.navBound) return;
      el.dataset.navBound = "1";
      el.addEventListener("click", function (e) {
        e.preventDefault();
        go(mod);
      });
    });
  }

  function initFromPage() {
    applyElderMode();
    var active = document.body.getAttribute("data-active-module");
    if (active) initBottomNav(active);
  }

  function initVoiceOnPage() {
    if (global.XueWuyaVoiceMode) {
      global.XueWuyaVoiceMode.initOnPage();
    }
  }

  global.XueWuyaNav = { MODULES: MODULES, getAppRoot: getAppRoot, go: go, initBottomNav: initBottomNav };

  function onReady() {
    initFromPage();
    if (!window.PAGE_CONFIG) {
      initVoiceOnPage();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }

  document.addEventListener("pageReady", function () {
    initFromPage();
    initVoiceOnPage();
  });
})(window);
