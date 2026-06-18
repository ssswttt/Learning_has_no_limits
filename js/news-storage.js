/**
 * 百晓堂便民资讯 — 收藏与浏览记录（仅登录用户，自留地共用）
 */
(function () {
  var COLLECT_KEY = "xuewuya_news_collect";
  var BROWSE_KEY = "xuewuya_news_browse";
  var MAX_BROWSE = 10;

  function isGuest() {
    return localStorage.getItem("xuewuya_auth") === "guest";
  }

  function truncate(text, max) {
    if (!text) return "";
    var s = String(text).replace(/\s+/g, " ").trim();
    return s.length <= max ? s : s.slice(0, max) + "...";
  }

  function snapshotFromArticle(article) {
    if (!article) return null;
    var body = article.body;
    var desc = "";
    if (Array.isArray(body) && body[0]) desc = body[0];
    else if (typeof body === "string") desc = body;
    return {
      id: article.id,
      title: article.title || "",
      source: article.source || "",
      time: article.time || "",
      reads: article.reads || "",
      img: article.img || "",
      desc: truncate(desc, 80),
    };
  }

  function readJson(key, fallback) {
    if (isGuest()) return fallback;
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, data) {
    if (isGuest()) return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  function getCollects() {
    return readJson(COLLECT_KEY, []);
  }

  function isCollected(id) {
    if (isGuest()) return false;
    return getCollects().some(function (item) {
      return String(item.id) === String(id);
    });
  }

  function addCollect(article) {
    if (isGuest()) return;
    var snap = snapshotFromArticle(article);
    if (!snap) return;
    var list = getCollects().filter(function (item) {
      return String(item.id) !== String(snap.id);
    });
    snap.collectedAt = Date.now();
    list.unshift(snap);
    writeJson(COLLECT_KEY, list);
  }

  function removeCollect(id) {
    if (isGuest()) return;
    var list = getCollects().filter(function (item) {
      return String(item.id) !== String(id);
    });
    writeJson(COLLECT_KEY, list);
  }

  function toggleCollect(article) {
    if (isGuest()) return false;
    if (isCollected(article.id)) {
      removeCollect(article.id);
      return false;
    }
    addCollect(article);
    return true;
  }

  function addBrowse(article) {
    if (isGuest()) return;
    var snap = snapshotFromArticle(article);
    if (!snap) return;
    var list = readJson(BROWSE_KEY, []).filter(function (item) {
      return String(item.id) !== String(snap.id);
    });
    snap.viewedAt = Date.now();
    list.unshift(snap);
    if (list.length > MAX_BROWSE) list = list.slice(0, MAX_BROWSE);
    writeJson(BROWSE_KEY, list);
  }

  function getBrowseHistory() {
    return readJson(BROWSE_KEY, []);
  }

  function getNewsDetailUrl(id) {
    return "baixiaotang.html?newsId=" + encodeURIComponent(id);
  }

  window.XueWuyaNewsStorage = {
    MAX_BROWSE: MAX_BROWSE,
    getCollects: getCollects,
    isCollected: isCollected,
    addCollect: addCollect,
    removeCollect: removeCollect,
    toggleCollect: toggleCollect,
    addBrowse: addBrowse,
    getBrowseHistory: getBrowseHistory,
    getNewsDetailUrl: getNewsDetailUrl,
    snapshotFromArticle: snapshotFromArticle,
  };
})();
