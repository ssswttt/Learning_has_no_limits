/**
 * 万花筒 - 手机端 Toast 提示
 */
(function (global) {
  var toastEl = null;
  var hideTimer = null;

  function ensureToast() {
    if (toastEl) return toastEl;
    toastEl = document.createElement("div");
    toastEl.className = "wht-toast";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    document.body.appendChild(toastEl);
    return toastEl;
  }

  function showToast(msg, duration) {
    var el = ensureToast();
    if (hideTimer) clearTimeout(hideTimer);
    el.textContent = msg;
    el.classList.add("show");
    hideTimer = setTimeout(function () {
      el.classList.remove("show");
    }, duration == null ? 2000 : duration);
  }

  global.showWhtToast = showToast;
})(window);
