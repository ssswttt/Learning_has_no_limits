/**
 * 学无涯 - 登录 / 游客状态
 */
(function (global) {
  var AUTH_KEY = "xuewuya_auth";
  var MODAL_ID = "xuewuya-login-modal";

  function getAuth() {
    return localStorage.getItem(AUTH_KEY);
  }

  function isGuest() {
    return getAuth() === "guest";
  }

  function isUser() {
    return getAuth() === "user";
  }

  function setGuest() {
    localStorage.setItem(AUTH_KEY, "guest");
  }

  function setUser() {
    localStorage.setItem(AUTH_KEY, "user");
  }

  function clearAuth() {
    localStorage.removeItem(AUTH_KEY);
  }

  function getLoginUrl() {
    var script = document.querySelector("script[src*=\"auth.js\"]");
    if (script && script.src) {
      return script.src.replace(/js\/auth\.js(\?.*)?$/, "login.html");
    }
    return "login.html";
  }

  function ensureModal() {
    if (document.getElementById(MODAL_ID)) return;
    var style = document.createElement("style");
    style.textContent =
      "#" + MODAL_ID + "{position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;align-items:center;justify-content:center;z-index:10000;padding:20px;}" +
      "#" + MODAL_ID + ".show{display:flex;}" +
      ".xuewuya-login-dialog{background:#fff;border-radius:14px;padding:24px 20px;width:100%;max-width:320px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.15);}" +
      ".xuewuya-login-dialog__text{font-size:16px;color:#333;line-height:1.5;margin-bottom:20px;}" +
      ".xuewuya-login-dialog__btn{display:block;width:100%;height:44px;border:none;border-radius:8px;font-size:15px;cursor:pointer;margin-bottom:10px;}" +
      ".xuewuya-login-dialog__btn--primary{background:#60C692;color:#fff;}" +
      ".xuewuya-login-dialog__btn--ghost{background:#f5f5f5;color:#666;}";
    document.head.appendChild(style);
    var el = document.createElement("div");
    el.id = MODAL_ID;
    el.innerHTML =
      '<div class="xuewuya-login-dialog">' +
      '<p class="xuewuya-login-dialog__text">该功能需要登录账号后使用</p>' +
      '<button type="button" class="xuewuya-login-dialog__btn xuewuya-login-dialog__btn--primary" data-action="login">跳转至登录页面</button>' +
      '<button type="button" class="xuewuya-login-dialog__btn xuewuya-login-dialog__btn--ghost" data-action="cancel">先不登录</button>' +
      "</div>";
    document.body.appendChild(el);
    el.addEventListener("click", function (e) {
      if (e.target === el) hideLoginRequiredModal();
    });
    el.querySelector("[data-action=login]").addEventListener("click", function () {
      hideLoginRequiredModal();
      window.location.href = getLoginUrl();
    });
    el.querySelector("[data-action=cancel]").addEventListener("click", function () {
      hideLoginRequiredModal();
      if (global._xuewuyaLoginModalOnCancel) {
        global._xuewuyaLoginModalOnCancel();
        global._xuewuyaLoginModalOnCancel = null;
      }
    });
  }

  function showLoginRequiredModal(onCancel) {
    ensureModal();
    global._xuewuyaLoginModalOnCancel = onCancel || null;
    document.getElementById(MODAL_ID).classList.add("show");
  }

  function hideLoginRequiredModal() {
    var m = document.getElementById(MODAL_ID);
    if (m) m.classList.remove("show");
  }

  function requireUser(fn) {
    if (isGuest()) {
      showLoginRequiredModal();
      return false;
    }
    if (typeof fn === "function") fn();
    return true;
  }

  function guardGuestInteractions(root, allowSelector) {
    if (!isGuest()) return;
    root = root || document.body;
    allowSelector = allowSelector || "[data-nav-module], .global-bottom-nav, #" + MODAL_ID;
    root.addEventListener(
      "click",
      function (e) {
        if (e.target.closest(allowSelector)) return;
        e.preventDefault();
        e.stopPropagation();
        showLoginRequiredModal();
      },
      true
    );
  }

  function blockGuestPage(fallbackUrl) {
    if (!isGuest()) return false;
    showLoginRequiredModal(function () {
      if (fallbackUrl) window.location.href = fallbackUrl;
    });
    return true;
  }

  global.XueWuyaAuth = {
    isGuest: isGuest,
    isUser: isUser,
    setGuest: setGuest,
    setUser: setUser,
    clearAuth: clearAuth,
    getLoginUrl: getLoginUrl,
    showLoginRequiredModal: showLoginRequiredModal,
    hideLoginRequiredModal: hideLoginRequiredModal,
    requireUser: requireUser,
    guardGuestInteractions: guardGuestInteractions,
    blockGuestPage: blockGuestPage,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureModal);
  } else {
    ensureModal();
  }
})(window);
