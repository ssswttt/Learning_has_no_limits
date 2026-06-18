/**
 * 组件加载器
 */
const ComponentLoader = (function () {
  const cache = new Map();

  function getBasePath() {
    const script = document.currentScript;
    if (script && script.src) {
      return script.src.replace(/\/js\/[^/]+$/, "");
    }
    const pageUrl = new URL(window.location.href);
    const path = pageUrl.pathname.replace(/\\/g, "/");
    const marker = "/chuanjialu/";
    const idx = path.indexOf(marker);
    if (idx !== -1) {
      return pageUrl.origin + path.slice(0, idx + marker.length - 1);
    }
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    for (const link of links) {
      if (link.href.includes("/css/main.css")) {
        return link.href.replace(/\/css\/main\.css.*$/, "");
      }
    }
    return ".";
  }

  const BASE = getBasePath();

  function interpolate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return data[key] !== undefined ? data[key] : "";
    });
  }

  async function fetchComponent(name) {
    if (cache.has(name)) return cache.get(name);
    const url = `${BASE}/components/${name}.html`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`无法加载组件: ${name}`);
    const html = await res.text();
    cache.set(name, html);
    return html;
  }

  async function render(name, data) {
    const template = await fetchComponent(name);
    return interpolate(template, data || {});
  }

  async function mountAll(root, skip) {
    root = root || document;
    skip = skip || new Set();
    const slots = root.querySelectorAll("[data-include]");
    for (const slot of slots) {
      const name = slot.dataset.include;
      if (skip.has(name)) continue;
      let props = {};
      try {
        props = JSON.parse(slot.dataset.props || "{}");
      } catch (_) { /* ignore */ }
      slot.innerHTML = await render(name, props);
    }
  }

  return { render, mountAll, BASE };
})();

/** 在线图片资源 */
const IMG = {
  hero: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
  tplLife: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80",
  tplFamily: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=200&q=80",
  tplHobby: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&q=80",
  tplFriends: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&q=80",
  memoirThumb1: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  memoirThumb2: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200&q=80",
  puffin: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=200&q=80",
  reading: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&q=80",
  parrot: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200&q=80",
  street: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&q=80",
  venice: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=600&q=80",
  map: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80",
  dog: (window.XueWuyaAvatars && window.XueWuyaAvatars.sonInLaw) || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  cow: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=80&q=80",
  avatar1: (window.XueWuyaAvatars && window.XueWuyaAvatars.avatar1) || "https://images.unsplash.com/photo-1557862921-37829c790f19?w=200&q=80",
  avatar2: (window.XueWuyaAvatars && window.XueWuyaAvatars.avatar2) || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80",
  avatar3: (window.XueWuyaAvatars && window.XueWuyaAvatars.avatar3) || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
  avatar4: (window.XueWuyaAvatars && window.XueWuyaAvatars.avatar4) || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  avatar5: (window.XueWuyaAvatars && window.XueWuyaAvatars.avatar5) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
  avatar6: (window.XueWuyaAvatars && window.XueWuyaAvatars.avatar6) || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80",
  masonry1: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80",
  masonry2: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
  masonry3: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80",
  masonry4: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80",
  masonry5: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
  masonry6: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80",
  styleNostalgic: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=160&q=80",
  styleSimple: "https://images.unsplash.com/photo-1557683316-973673baf926?w=160&q=80",
  styleWarm: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=160&q=80",
  styleRetro: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=160&q=80",
};

function getTabLinks() {
  const base = ComponentLoader.BASE;
  return {
    memoirHref: `${base}/pages/memoir/home.html`,
    photoHref: `${base}/pages/story-card/list.html`,
    msgHref: `${base}/pages/message-board/home.html`,
  };
}

function tabActiveClass(activeTab, tabName) {
  return activeTab === tabName ? "top-tabs__tab--active" : "";
}

async function initPage(config) {
  try {
    const links = getTabLinks();
    const skip = new Set(["page-header"]);
    const activeTab = config.activeTab || "memoir";

    const headerSlot = document.querySelector('[data-include="page-header"]');
    if (headerSlot) {
      headerSlot.innerHTML = await ComponentLoader.render("page-header", {
        memoirActive: tabActiveClass(activeTab, "memoir"),
        photoActive: tabActiveClass(activeTab, "photo"),
        msgActive: tabActiveClass(activeTab, "msg"),
        ...links,
      });
    }

    await ComponentLoader.mountAll(document, skip);
    initCharCounters();
    if (window.XueWuyaNav) {
      XueWuyaNav.initBottomNav("chuanjia");
    }
    document.dispatchEvent(new CustomEvent("pageReady"));
  } catch (err) {
    console.error("[传家录] 页面组件加载失败:", err);
    const scroll = document.querySelector(".phone__scroll");
    if (scroll && !scroll.querySelector(".load-error")) {
      scroll.insertAdjacentHTML(
        "afterbegin",
        '<p class="load-error" style="padding:24px 16px;color:#333;font-size:14px;line-height:1.6;text-align:center;">页面内容加载失败，请通过本地服务器（如 Live Server）打开项目，不要直接双击 HTML 文件。</p>'
      );
    }
  }
}

function initCharCounters() {
  document.querySelectorAll(".input-card__textarea").forEach((ta) => {
    const countEl = ta.closest(".input-card")?.querySelector(".input-card__count");
    if (!countEl) return;
    const max = ta.maxLength || 100;
    const update = () => { countEl.textContent = `${ta.value.length}/${max}字`; };
    ta.addEventListener("input", update);
    update();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.PAGE_CONFIG) initPage(window.PAGE_CONFIG);
});
