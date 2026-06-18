/**
 * 万花筒 — 购课与订单（仅登录用户）
 */
(function () {
  var PURCHASED_KEY = "purchased";
  var ORDERS_KEY = "orders";

  function isGuest() {
    return localStorage.getItem("xuewuya_auth") === "guest";
  }

  function getPurchased() {
    if (isGuest()) return [];
    try {
      return JSON.parse(localStorage.getItem(PURCHASED_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function savePurchased(list) {
    if (isGuest()) return;
    localStorage.setItem(PURCHASED_KEY, JSON.stringify(list));
  }

  function isPurchased(id) {
    return getPurchased().some(function (item) {
      return String(item) === String(id);
    });
  }

  function addPurchase(id) {
    if (isGuest()) return;
    var list = getPurchased();
    if (!list.some(function (item) { return String(item) === String(id); })) {
      list.push(id);
      savePurchased(list);
    }
  }

  function getOrders() {
    if (isGuest()) return [];
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]").map(function (item) {
        if (!item.delayDay) item.delayDay = "";
        return item;
      });
    } catch (e) {
      return [];
    }
  }

  function saveOrders(list) {
    if (isGuest()) return;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
  }

  window.XueWuyaWhtStorage = {
    getPurchased: getPurchased,
    savePurchased: savePurchased,
    isPurchased: isPurchased,
    addPurchase: addPurchase,
    getOrders: getOrders,
    saveOrders: saveOrders,
  };
})();
