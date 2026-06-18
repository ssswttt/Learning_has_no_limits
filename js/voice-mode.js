/**
 * 语音播报 - 与自留地 home.html 逻辑一致
 * localStorage key: voiceMode
 * 开启后切换页面自动朗读当前页文本
 */
(function (global) {
  var STORAGE_KEY = "voiceMode";
  var synth = window.speechSynthesis;
  var ICON_FILTER = /[›‹🔊👵⚙️👥📁🏠💡📺🌍📤👤🌿🕐]/g;

  function isEnabled() {
    return localStorage.getItem(STORAGE_KEY) === "true";
  }

  function stopSpeak() {
    if (synth && synth.speaking) synth.cancel();
  }

  function cleanText(text) {
    return (text || "").replace(ICON_FILTER, "").replace(/\s+/g, " ").trim() || "当前页面暂无内容";
  }

  function getVisiblePage() {
    var pages = document.querySelectorAll(".page");
    for (var i = 0; i < pages.length; i++) {
      if (window.getComputedStyle(pages[i]).display !== "none") {
        return pages[i];
      }
    }
    return null;
  }

  function getActivePageText() {
    var activePage = document.querySelector(".page.active");
    if (activePage) {
      return cleanText(activePage.innerText);
    }

    var visiblePage = getVisiblePage();
    if (visiblePage) {
      return cleanText(visiblePage.innerText);
    }

    var scroll = document.querySelector(".phone__scroll");
    if (scroll) {
      return cleanText(scroll.innerText);
    }

    var container = document.querySelector(".app-container");
    if (container) {
      return cleanText(container.innerText);
    }

    return cleanText(document.body.innerText);
  }

  function readPageText() {
    if (!isEnabled()) return;
    stopSpeak();
    if (!synth) return;
    var utter = new SpeechSynthesisUtterance(getActivePageText());
    utter.lang = "zh-CN";
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.volume = 1;
    synth.speak(utter);
  }

  function scheduleRead(delay) {
    setTimeout(readPageText, delay == null ? 200 : delay);
  }

  function toggle() {
    var next = !isEnabled();
    localStorage.setItem(STORAGE_KEY, next);
    if (next) {
      readPageText();
    } else {
      stopSpeak();
    }
    return next;
  }

  function initOnPage() {
    if (isEnabled()) {
      scheduleRead(300);
    }
  }

  global.XueWuyaVoiceMode = {
    isEnabled: isEnabled,
    toggle: toggle,
    readPageText: readPageText,
    scheduleRead: scheduleRead,
    stopSpeak: stopSpeak,
    initOnPage: initOnPage,
  };

  if (!document.querySelector('script[src*="nav.js"]')) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initOnPage);
    } else {
      initOnPage();
    }
  }
})(window);
