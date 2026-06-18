/**
 * 长辈模式 - 与自留地逻辑一致
 * localStorage key: elderMode
 * 开启时 document.body 添加 class "elder"
 */
(function (global) {
  var STORAGE_KEY = "elderMode";

  function isEnabled() {
    return localStorage.getItem(STORAGE_KEY) === "true";
  }

  function apply() {
    document.body.classList.toggle("elder", isEnabled());
  }

  function toggle() {
    var next = !isEnabled();
    localStorage.setItem(STORAGE_KEY, next);
    apply();
    return next;
  }

  function init() {
    apply();
  }

  global.XueWuyaElderMode = {
    isEnabled: isEnabled,
    apply: apply,
    toggle: toggle,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
