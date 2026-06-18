/**
 * 页面交互：轮播、故事卡表单、留言板、回忆录编辑等
 */

const MAX_CHAPTER_PHOTOS = 3;

function showToast(message, type = "info") {
  const phone = document.querySelector(".phone");
  if (!phone) return;
  let toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "app-toast";
    phone.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `app-toast app-toast--${type}`;
  requestAnimationFrame(() => toast.classList.add("app-toast--show"));
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("app-toast--show"), 2400);
}

function ensureConfirmOverlay() {
  const phone = document.querySelector(".phone");
  if (!phone) return null;

  let overlay = document.getElementById("appConfirmOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "appConfirmOverlay";
    overlay.className = "app-confirm-overlay";
    overlay.innerHTML = `
      <div class="app-confirm" role="dialog" aria-modal="true">
        <p class="app-confirm__message"></p>
        <div class="app-confirm__actions">
          <button type="button" class="app-confirm__btn app-confirm__btn--cancel"></button>
          <button type="button" class="app-confirm__btn app-confirm__btn--ok"></button>
        </div>
      </div>
    `;
    phone.appendChild(overlay);
  }
  return overlay;
}

function showConfirm(options = {}) {
  const {
    message = "确定执行此操作吗？",
    confirmText = "确定",
    cancelText = "取消",
    danger = false,
  } = options;

  return new Promise((resolve) => {
    const overlay = ensureConfirmOverlay();
    if (!overlay) {
      resolve(false);
      return;
    }

    const messageEl = overlay.querySelector(".app-confirm__message");
    const cancelBtn = overlay.querySelector(".app-confirm__btn--cancel");
    const okBtn = overlay.querySelector(".app-confirm__btn--ok");
    if (!messageEl || !cancelBtn || !okBtn) {
      resolve(false);
      return;
    }

    messageEl.textContent = message;
    cancelBtn.textContent = cancelText;
    okBtn.textContent = confirmText;
    okBtn.classList.toggle("app-confirm__btn--danger", danger);

    let settled = false;
    function finish(result) {
      if (settled) return;
      settled = true;
      overlay.classList.remove("app-confirm-overlay--visible");
      if (!document.querySelector(".overlay--visible")) {
        document.body.classList.remove("modal-open");
      }
      resolve(result);
    }

    cancelBtn.onclick = () => finish(false);
    okBtn.onclick = () => finish(true);
    overlay.onclick = (e) => {
      if (e.target === overlay) finish(false);
    };

    overlay.classList.add("app-confirm-overlay--visible");
    document.body.classList.add("modal-open");
    cancelBtn.focus();
  });
}

function readImageFile(file, maxWidth = 480) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("请选择图片文件"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("图片读取失败"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}

function getPageSlug() {
  return window.location.pathname.split("/").pop().replace(".html", "") || "page";
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const MEMOIR_TEMPLATES = {
  "life-story-create": {
    type: "life-story",
    label: "人生故事",
    viewPage: "life-story-view.html",
    defaultImg: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80",
  },
  "family-create": {
    type: "family",
    label: "我的家庭",
    viewPage: "life-story-view.html",
    defaultImg: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=200&q=80",
  },
  "hobby-create": {
    type: "hobby",
    label: "我的爱好",
    viewPage: "hobby-view.html",
    defaultImg: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&q=80",
  },
  "friends-create": {
    type: "friends",
    label: "我的挚友",
    viewPage: "life-story-view.html",
    defaultImg: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&q=80",
  },
};

function getMemoirTemplateMeta(slug) {
  return MEMOIR_TEMPLATES[slug] || {
    type: slug,
    label: "回忆录",
    viewPage: "life-story-view.html",
    defaultImg: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  };
}

function getMemoirCreateReturnHref(slug) {
  const params = new URLSearchParams(window.location.search);
  if (params.get("from") === "template-list") return "template-list.html";
  return "home.html";
}

function getMemoirViewReturnHref() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("from") === "memoir-list") return "memoir-list.html";
  return "home.html";
}

function getMemoirCover(chapters, defaultImg) {
  for (const ch of chapters || []) {
    if (ch.photos?.length) return ch.photos[0];
  }
  return defaultImg;
}

function getMemoirDescription(data) {
  for (const ch of data.chapters || []) {
    if (ch.text?.trim()) return ch.text.trim();
  }
  return (data.title || "").trim() || "暂无描述";
}

const MemoirStorage = {
  KEY: "chuanjialu_memoir_draft",
  SAVED_KEY: "chuanjialu_memoirs",

  load(slug) {
    try {
      const all = JSON.parse(sessionStorage.getItem(this.KEY)) || {};
      return all[slug] || { title: "", chapters: [] };
    } catch {
      return { title: "", chapters: [] };
    }
  },

  save(slug, data) {
    try {
      const all = JSON.parse(sessionStorage.getItem(this.KEY)) || {};
      all[slug] = { ...this.load(slug), ...data };
      sessionStorage.setItem(this.KEY, JSON.stringify(all));
    } catch (e) {
      showToast("保存失败，内容过大请减少图片", "error");
    }
  },

  listSaved() {
    try {
      return JSON.parse(localStorage.getItem(this.SAVED_KEY)) || [];
    } catch {
      return [];
    }
  },

  getSaved(id) {
    return this.listSaved().find((m) => m.id === id) || null;
  },

  saveMemoir(slug, data, meta, existingId) {
    const card = {
      id: existingId || String(Date.now()),
      slug,
      templateType: meta.type,
      templateLabel: meta.label,
      viewPage: meta.viewPage,
      title: (data.title || "").trim() || "未命名回忆录",
      chapters: data.chapters || [],
      coverImage: getMemoirCover(data.chapters, meta.defaultImg),
      description: getMemoirDescription(data),
      createdAt: Date.now(),
    };
    const list = this.listSaved();
    if (existingId) {
      const idx = list.findIndex((m) => m.id === existingId);
      if (idx >= 0) {
        card.createdAt = list[idx].createdAt;
        list[idx] = card;
      } else {
        list.unshift(card);
      }
    } else {
      list.unshift(card);
    }
    try {
      localStorage.setItem(this.SAVED_KEY, JSON.stringify(list));
    } catch (e) {
      showToast("保存失败，内容过大请减少图片", "error");
      return null;
    }
    return card;
  },

  deleteSaved(id) {
    const list = this.listSaved();
    const memoir = list.find((m) => m.id === id);
    if (!memoir) return false;
    localStorage.setItem(this.SAVED_KEY, JSON.stringify(list.filter((m) => m.id !== id)));
    if (memoir.slug) {
      try {
        const all = JSON.parse(sessionStorage.getItem(this.KEY)) || {};
        delete all[memoir.slug];
        sessionStorage.setItem(this.KEY, JSON.stringify(all));
      } catch {
        /* ignore */
      }
    }
    return true;
  },
};

const StoryCardStorage = {
  KEY: "chuanjialu_story_card_draft",
  SAVED_KEY: "chuanjialu_story_cards",

  load() {
    try {
      return JSON.parse(sessionStorage.getItem(this.KEY)) || {};
    } catch {
      return {};
    }
  },

  save(data) {
    const draft = { ...this.load(), ...data };
    sessionStorage.setItem(this.KEY, JSON.stringify(draft));
    return draft;
  },

  clearDraft() {
    sessionStorage.removeItem(this.KEY);
  },

  EXIT_KEY: "chuanjialu_story_card_exit_href",

  listSaved() {
    try {
      return JSON.parse(localStorage.getItem(this.SAVED_KEY)) || [];
    } catch {
      return [];
    }
  },

  getSaved(id) {
    return this.listSaved().find((c) => c.id === id) || null;
  },

  saveCard(existingId) {
    const draft = this.load();
    const card = {
      id: existingId || String(Date.now()),
      title: (draft.title || "").trim() || "未命名故事卡",
      coverImage: draft.coverImage || "",
      location: draft.location || "",
      dateISO: draft.dateISO || "",
      dateDisplay: draft.dateDisplay || "",
      mood: draft.mood || "",
      description: draft.description || "",
      createdAt: Date.now(),
    };
    const list = this.listSaved();
    if (existingId) {
      const idx = list.findIndex((c) => c.id === existingId);
      if (idx >= 0) {
        card.createdAt = list[idx].createdAt;
        list[idx] = card;
      } else {
        list.unshift(card);
      }
    } else {
      list.unshift(card);
    }
    try {
      localStorage.setItem(this.SAVED_KEY, JSON.stringify(list));
    } catch (e) {
      showToast("保存失败，内容过大请减少图片", "error");
      return null;
    }
    this.clearDraft();
    return card;
  },

  deleteSaved(id) {
    const list = this.listSaved();
    if (!list.some((c) => c.id === id)) return false;
    localStorage.setItem(this.SAVED_KEY, JSON.stringify(list.filter((c) => c.id !== id)));
    return true;
  },
};

function initHeroCarousel() {
  const root = document.getElementById("heroCarousel");
  if (!root) return;

  const slides = [...root.querySelectorAll(".hero-carousel__slide")];
  const dots = [...root.querySelectorAll(".hero-carousel__dot")];
  if (!slides.length) return;

  let index = 0;
  let timer = null;
  let touchStartX = 0;

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, j) => s.classList.toggle("hero-carousel__slide--active", j === index));
    dots.forEach((d, j) => d.classList.toggle("hero-carousel__dot--active", j === index));
  }

  function next() { goTo(index + 1); }

  function startAuto() {
    stopAuto();
    timer = setInterval(next, 4000);
  }

  function stopAuto() {
    if (timer) clearInterval(timer);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      goTo(i);
      startAuto();
    });
  });

  root.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    stopAuto();
  }, { passive: true });

  root.addEventListener("touchend", (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 40) goTo(index + (diff < 0 ? 1 : -1));
    startAuto();
  }, { passive: true });

  startAuto();
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function initScrollDatePicker(container) {
  const yearCol = container.querySelector('[data-picker="year"]');
  const monthCol = container.querySelector('[data-picker="month"]');
  const dayCol = container.querySelector('[data-picker="day"]');
  if (!yearCol || !monthCol || !dayCol) return null;

  const now = new Date();
  let state = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };

  const draft = StoryCardStorage.load();
  if (draft.dateISO) {
    const d = new Date(draft.dateISO);
    if (!isNaN(d.getTime())) {
      state = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
    }
  }

  function renderCol(col, items, selected, formatter) {
    col.innerHTML = items.map((v) => {
      const label = formatter(v);
      const active = v === selected ? " date-picker__item--active" : "";
      return `<div class="date-picker__item${active}" data-value="${v}">${label}</div>`;
    }).join("");
    const activeEl = col.querySelector(".date-picker__item--active");
    if (activeEl) activeEl.scrollIntoView({ block: "center" });
  }

  function renderYears() {
    const years = [];
    for (let y = 1950; y <= 2030; y++) years.push(y);
    renderCol(yearCol, years, state.year, (y) => `${y}年`);
  }

  function renderMonths() {
    const months = [];
    for (let m = 1; m <= 12; m++) months.push(m);
    renderCol(monthCol, months, state.month, (m) => `${m}月`);
  }

  function renderDays() {
    const max = daysInMonth(state.year, state.month);
    if (state.day > max) state.day = max;
    const days = [];
    for (let d = 1; d <= max; d++) days.push(d);
    renderCol(dayCol, days, state.day, (d) => `${d}日`);
  }

  function bindCol(col, key) {
    col.addEventListener("click", (e) => {
      const item = e.target.closest(".date-picker__item");
      if (!item) return;
      state[key] = parseInt(item.dataset.value, 10);
      renderYears();
      renderMonths();
      renderDays();
    });
  }

  renderYears();
  renderMonths();
  renderDays();
  bindCol(yearCol, "year");
  bindCol(monthCol, "month");
  bindCol(dayCol, "day");

  return {
    getISO() {
      const m = String(state.month).padStart(2, "0");
      const d = String(state.day).padStart(2, "0");
      return `${state.year}-${m}-${d}`;
    },
    getDisplay() {
      const m = String(state.month).padStart(2, "0");
      const d = String(state.day).padStart(2, "0");
      return `${m}月${d}日`;
    },
  };
}

function parseMoodTags(mood) {
  if (!mood) return [];
  return mood.split(/[,，、\s]+/).map((s) => s.trim()).filter(Boolean);
}

function resolveStoryCardEditContext(pageParams) {
  if (pageParams.get("new") === "1") return null;

  const editId = pageParams.get("edit");
  if (editId) {
    const card = StoryCardStorage.getSaved(editId);
    if (!card) return null;
    return {
      editingStoryCardId: editId,
      exitHref: `detail.html?id=${encodeURIComponent(editId)}`,
    };
  }

  if (pageParams.get("mode") === "edit") {
    return {
      editingStoryCardId: null,
      exitHref: sessionStorage.getItem(StoryCardStorage.EXIT_KEY) || "detail.html",
    };
  }

  return null;
}

function initStoryCardForm() {
  const form = document.getElementById("storyCardForm");
  if (!form) return;

  const pageParams = new URLSearchParams(window.location.search);
  const editContext = resolveStoryCardEditContext(pageParams);
  let editingStoryCardId = editContext?.editingStoryCardId || null;

  if (pageParams.get("new") === "1") {
    StoryCardStorage.clearDraft();
    sessionStorage.removeItem(StoryCardStorage.EXIT_KEY);
  } else if (editingStoryCardId) {
    const card = StoryCardStorage.getSaved(editingStoryCardId);
    if (card) {
      StoryCardStorage.save({
        title: card.title || "",
        coverImage: card.coverImage || "",
        location: card.location || "",
        dateISO: card.dateISO || "",
        dateDisplay: card.dateDisplay || "",
        mood: card.mood || "",
        description: card.description || "",
      });
    }
  }

  const backBtn = document.getElementById("storyCardBackBtn");
  const createHeader = document.getElementById("storyCreateHeader");
  const exitBtn = document.getElementById("storyCardExitBtn");

  if (editContext) {
    if (backBtn) backBtn.hidden = true;
    if (exitBtn) {
      exitBtn.hidden = false;
      createHeader?.classList.add("story-create-header--nav");
      exitBtn.addEventListener("click", () => {
        StoryCardStorage.clearDraft();
        sessionStorage.removeItem(StoryCardStorage.EXIT_KEY);
        window.location.href = editContext.exitHref;
      });
    }
  } else {
    createHeader?.classList.add("story-create-header--nav");
  }

  const draft = StoryCardStorage.load();
  const titleInput = form.querySelector("#storyCardTitleInput");
  const titleEditBtn = form.querySelector("#storyCardTitleEdit");

  if (titleInput) {
    titleInput.value = draft.title || "";
    titleInput.addEventListener("input", () => {
      StoryCardStorage.save({ title: titleInput.value });
    });
    titleEditBtn?.addEventListener("click", () => {
      titleInput.focus();
      titleInput.select();
    });
  }

  const placeholders = {
    location: "定位选择地点",
    date: "请选择时间",
  };

  const locationText = form.querySelector("#fieldLocationText");
  const dateText = form.querySelector("#fieldDateText");
  const moodRow = form.querySelector("#rowMood");
  const moodText = form.querySelector("#fieldMoodText");
  const moodInput = form.querySelector("#fieldMoodInput");
  const moodEditBtn = form.querySelector("#fieldMoodEdit");
  const descRow = form.querySelector("#rowDesc");
  const descText = form.querySelector("#fieldDescText");
  const descInput = form.querySelector("#fieldDescInput");
  const descEditBtn = form.querySelector("#fieldDescEdit");

  const moodPlaceholder = "请填写心情";
  const descPlaceholder = "用简短的一句话描述这个故事卡……";

  function syncFields() {
    const d = StoryCardStorage.load();
    if (locationText) {
      locationText.textContent = d.location || placeholders.location;
      locationText.classList.toggle("form-row__text--filled", !!d.location);
    }
    if (dateText) {
      dateText.textContent = d.dateDisplay || placeholders.date;
      dateText.classList.toggle("form-row__text--filled", !!d.dateDisplay);
    }
  }
  syncFields();

  function syncMoodDisplay() {
    if (!moodText) return;
    const val = StoryCardStorage.load().mood || "";
    const tags = parseMoodTags(val);
    if (tags.length) {
      moodText.innerHTML = `<span class="form-row__tags">${tags.map((t) => `<span class="tag-pill">${escapeHtml(t)}</span>`).join("")}</span>`;
      moodText.classList.add("form-row__text--filled");
    } else {
      moodText.textContent = moodPlaceholder;
      moodText.classList.remove("form-row__text--filled");
    }
  }

  function syncDescDisplay() {
    if (!descText) return;
    const val = StoryCardStorage.load().description || "";
    descText.textContent = val || descPlaceholder;
    descText.classList.toggle("form-row__text--filled", !!val);
  }

  function initInlineEditableField({ row, textEl, inputEl, editBtn, key, syncDisplay, multiline }) {
    if (!row || !textEl || !inputEl || !editBtn) return;

    function enterEdit() {
      document.querySelectorAll(".form-row--editing").forEach((el) => {
        if (el !== row) el.querySelector("input, textarea")?.blur();
      });
      inputEl.value = StoryCardStorage.load()[key] || "";
      row.classList.add("form-row--editing");
      inputEl.focus();
      if (!multiline) inputEl.select();
    }

    function exitEdit() {
      StoryCardStorage.save({ [key]: inputEl.value });
      row.classList.remove("form-row--editing");
      syncDisplay();
    }

    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      enterEdit();
    });

    inputEl.addEventListener("blur", exitEdit);

    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !multiline) {
        e.preventDefault();
        inputEl.blur();
      }
      if (e.key === "Escape") {
        inputEl.value = StoryCardStorage.load()[key] || "";
        row.classList.remove("form-row--editing");
        syncDisplay();
      }
    });

    syncDisplay();
  }

  initInlineEditableField({
    row: moodRow,
    textEl: moodText,
    inputEl: moodInput,
    editBtn: moodEditBtn,
    key: "mood",
    syncDisplay: syncMoodDisplay,
    multiline: false,
  });

  initInlineEditableField({
    row: descRow,
    textEl: descText,
    inputEl: descInput,
    editBtn: descEditBtn,
    key: "description",
    syncDisplay: syncDescDisplay,
    multiline: true,
  });

  const locationOverlay = document.getElementById("locationOverlay");
  const dateOverlay = document.getElementById("dateOverlay");
  const locationInput = document.getElementById("locationInput");
  const locationHint = document.getElementById("locationHint");
  let datePicker = null;
  let locationDraft = draft.location || "";

  function openOverlay(overlay) {
    overlay?.classList.add("overlay--visible");
    document.body.classList.add("modal-open");
  }

  function closeOverlay(overlay) {
    overlay?.classList.remove("overlay--visible");
    if (!document.querySelector(".overlay--visible")) {
      document.body.classList.remove("modal-open");
    }
  }

  form.querySelector("#rowLocation")?.addEventListener("click", () => {
    locationDraft = StoryCardStorage.load().location || "";
    if (locationInput) locationInput.value = locationDraft;
    if (locationHint) locationHint.textContent = "";
    openOverlay(locationOverlay);
  });

  form.querySelector("#rowDate")?.addEventListener("click", () => {
    if (!datePicker) datePicker = initScrollDatePicker(document.getElementById("datePickerRoot"));
    openOverlay(dateOverlay);
  });

  document.getElementById("btnLocate")?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      if (locationHint) locationHint.textContent = "浏览器不支持定位，请手动输入地址";
      return;
    }
    if (locationHint) locationHint.textContent = "正在定位…";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const text = `当前位置（${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E）`;
        if (locationInput) locationInput.value = text;
        locationDraft = text;
        if (locationHint) locationHint.textContent = "定位成功，可编辑后点击确定保存";
      },
      () => {
        const fallback = "河南省安阳市文峰区中华路街道";
        if (locationInput) locationInput.value = fallback;
        locationDraft = fallback;
        if (locationHint) locationHint.textContent = "定位未授权，已填入示例地址，可修改";
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });

  locationInput?.addEventListener("input", () => {
    locationDraft = locationInput.value.trim();
  });

  document.getElementById("locationCancel")?.addEventListener("click", () => {
    closeOverlay(locationOverlay);
  });

  document.getElementById("locationConfirm")?.addEventListener("click", () => {
    const val = (locationInput?.value || "").trim();
    if (!val) {
      if (locationHint) locationHint.textContent = "请输入或定位选择地点";
      showToast("请输入或定位选择地点", "error");
      return;
    }
    StoryCardStorage.save({ location: val });
    syncFields();
    closeOverlay(locationOverlay);
    showToast("地点已保存", "success");
  });

  locationOverlay?.addEventListener("click", (e) => {
    if (e.target === locationOverlay) closeOverlay(locationOverlay);
  });

  document.getElementById("dateCancel")?.addEventListener("click", () => {
    closeOverlay(dateOverlay);
  });

  document.getElementById("dateConfirm")?.addEventListener("click", () => {
    if (!datePicker) datePicker = initScrollDatePicker(document.getElementById("datePickerRoot"));
    const iso = datePicker.getISO();
    const display = datePicker.getDisplay();
    StoryCardStorage.save({ dateISO: iso, dateDisplay: display });
    syncFields();
    closeOverlay(dateOverlay);
    showToast("日期已保存", "success");
  });

  dateOverlay?.addEventListener("click", (e) => {
    if (e.target === dateOverlay) closeOverlay(dateOverlay);
  });

  const params = new URLSearchParams(window.location.search);
  const open = params.get("open");
  if (open === "location") form.querySelector("#rowLocation")?.click();
  if (open === "date") form.querySelector("#rowDate")?.click();

  document.getElementById("storyCardSaveBtn")?.addEventListener("click", () => {
    const current = StoryCardStorage.load();
    const title = (titleInput?.value || current.title || "").trim();
    if (!title) {
      showToast("请填写故事卡标题", "error");
      titleInput?.focus();
      return;
    }
    if (!current.coverImage) {
      showToast("请添加故事卡照片", "error");
      return;
    }
    StoryCardStorage.save({ title });
    const card = StoryCardStorage.saveCard(editingStoryCardId);
    if (!card) return;
    showToast(editingStoryCardId ? "故事卡已更新" : "故事卡已保存", "success");
    setTimeout(() => {
      window.location.href = editingStoryCardId
        ? `detail.html?id=${encodeURIComponent(card.id)}`
        : "list.html";
    }, 400);
  });
}

function initStoryCardList() {
  const userList = document.getElementById("storyCardUserList");
  if (!userList) return;

  const fallbackImg = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80";
  const savedCards = StoryCardStorage.listSaved();

  userList.innerHTML = savedCards.map((card, i) => {
    const size = i % 2 === 0 ? "short" : "tall";
    const title = card.title || "未命名故事卡";
    const img = card.coverImage || fallbackImg;
    return `<a class="masonry-card masonry-card--${size}" href="detail.html?id=${encodeURIComponent(card.id)}">
      <img class="masonry-card__img" src="${img}" alt="${escapeHtml(title)}">
      <p class="masonry-card__title">${escapeHtml(title)}</p>
    </a>`;
  }).join("");
}

function loadStoryCardDetailIntoDraft() {
  const title = document.getElementById("detailTitle")?.textContent?.trim() || "";
  const coverImage = document.getElementById("detailHero")?.src || "";
  const location = document.getElementById("detailLocation")?.textContent?.trim() || "";
  const dateDisplay = document.getElementById("detailDate")?.textContent?.trim() || "";
  const moodTags = [...document.querySelectorAll("#detailMoodTags .tag-pill")]
    .map((el) => el.textContent.trim())
    .filter(Boolean);
  const mood = moodTags.join("、");
  const descEl = document.getElementById("detailDescription");
  let description = descEl?.textContent?.trim() || "";
  if (["用简短的一句话描述这个故事卡……", "未填写描述"].includes(description)) {
    description = "";
  }

  StoryCardStorage.save({
    title,
    coverImage,
    location,
    dateDisplay,
    dateISO: "",
    mood,
    description,
  });
}

function initStoryCardDetail() {
  const wrap = document.querySelector(".story-detail-wrap");
  if (!wrap) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const editBtn = document.getElementById("storyCardDetailEditBtn");
  const savedCard = id ? StoryCardStorage.getSaved(id) : null;

  if (savedCard) {
    const titleEl = document.getElementById("detailTitle");
    const heroEl = document.getElementById("detailHero");
    const locationEl = document.getElementById("detailLocation");
    const dateEl = document.getElementById("detailDate");
    const moodEl = document.getElementById("detailMoodTags");
    const descEl = document.getElementById("detailDescription");

    if (titleEl) titleEl.textContent = savedCard.title || "未命名故事卡";
    if (heroEl && savedCard.coverImage) {
      heroEl.src = savedCard.coverImage;
      heroEl.alt = savedCard.title || "故事卡封面";
    }
    if (locationEl) locationEl.textContent = savedCard.location || "未填写地点";
    if (dateEl) dateEl.textContent = savedCard.dateDisplay || "未选择时间";

    if (moodEl) {
      const tags = parseMoodTags(savedCard.mood);
      moodEl.innerHTML = tags.length
        ? tags.map((t) => `<span class="tag-pill">${t}</span>`).join("")
        : `<span class="meta-row__text meta-row__text--muted">未填写心情</span>`;
    }

    if (descEl) {
      descEl.textContent = savedCard.description || "未填写描述";
      descEl.classList.toggle("meta-row__text--muted", !savedCard.description);
    }
  } else if (id) {
    showToast("故事卡不存在或已被删除", "error");
  }

  if (editBtn) {
    editBtn.addEventListener("click", () => {
      if (savedCard) {
        sessionStorage.setItem(
          StoryCardStorage.EXIT_KEY,
          `detail.html?id=${encodeURIComponent(id)}`
        );
        window.location.href = `create.html?edit=${encodeURIComponent(id)}`;
      } else {
        loadStoryCardDetailIntoDraft();
        sessionStorage.setItem(StoryCardStorage.EXIT_KEY, "detail.html");
        window.location.href = "create.html?mode=edit";
      }
    });
  }

  const deleteBtn = document.getElementById("storyCardDetailDeleteBtn");
  if (deleteBtn) {
    deleteBtn.hidden = !savedCard;
    deleteBtn.addEventListener("click", async () => {
      if (!savedCard || !id) return;
      const ok = await showConfirm({
        message: `确定删除「${savedCard.title || "这条故事卡"}」吗？`,
        confirmText: "删除",
        cancelText: "取消",
        danger: true,
      });
      if (ok && StoryCardStorage.deleteSaved(id)) {
        showToast("故事卡已删除", "success");
        setTimeout(() => { window.location.href = "list.html"; }, 400);
      }
    });
  }
}

function initStoryCardSubForm(type) {
  const draft = StoryCardStorage.load();
  const input = document.getElementById("subFormInput");
  const key = type === "mood" ? "mood" : "description";
  const placeholder = type === "mood" ? "请输入心情…" : "请输入描述…";
  if (input) {
    input.value = draft[key] || "";
    input.placeholder = placeholder;
  }

  document.getElementById("subFormSave")?.addEventListener("click", () => {
    const val = (input?.value || "").trim();
    if (!val) {
      showToast(type === "mood" ? "请填写心情" : "请填写描述", "error");
      return;
    }
    StoryCardStorage.save({ [key]: val });
    showToast("已保存", "success");
    setTimeout(() => { window.location.href = "create.html"; }, 400);
  });
}

function initStoryCardPhotoUpload() {
  const btn = document.getElementById("storyCardPhotoUpload");
  const input = document.getElementById("storyCardPhotoInput");
  if (!btn || !input) return;

  const draft = StoryCardStorage.load();

  function renderPreview(src) {
    if (src) {
      btn.classList.add("photo-upload--has-image");
      btn.innerHTML = `<img class="photo-upload__preview" src="${src}" alt="故事卡封面"><button type="button" class="photo-upload__change">更换</button>`;
      btn.querySelector(".photo-upload__change")?.addEventListener("click", (e) => {
        e.stopPropagation();
        input.click();
      });
    } else {
      btn.classList.remove("photo-upload--has-image");
      btn.innerHTML = `<div class="photo-upload__placeholder"><div class="photo-upload__icon">📷</div><span>添加照片</span></div>`;
    }
  }

  renderPreview(draft.coverImage);

  btn.addEventListener("click", () => {
    if (!btn.classList.contains("photo-upload--has-image")) input.click();
  });

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    try {
      const dataUrl = await readImageFile(file);
      StoryCardStorage.save({ coverImage: dataUrl });
      renderPreview(dataUrl);
      showToast("照片已添加", "success");
    } catch (err) {
      showToast(err.message || "上传失败", "error");
    }
  });
}

function initMemoirEditor() {
  const scroll = document.querySelector(".page--memoir-edit .phone__scroll");
  if (!scroll) return;

  const slug = getPageSlug();
  const pageParams = new URLSearchParams(window.location.search);
  const editId = pageParams.get("edit");
  let editingMemoirId = null;
  let draft = MemoirStorage.load(slug);

  const cancelLink = document.querySelector(".editor-header__cancel");
  if (cancelLink) cancelLink.href = getMemoirCreateReturnHref(slug);

  if (editId) {
    const memoir = MemoirStorage.getSaved(editId);
    if (memoir && memoir.slug === slug) {
      editingMemoirId = editId;
      draft = {
        title: memoir.title || "",
        chapters: JSON.parse(JSON.stringify(memoir.chapters || [])),
      };
      MemoirStorage.save(slug, draft);
    }
  } else {
    draft = { title: "", chapters: [] };
    MemoirStorage.save(slug, draft);
  }

  const titleInput = document.getElementById("memoirTitleInput");
  const chaptersList = document.getElementById("memoirChaptersList") || scroll;
  const addChapterBtn = document.getElementById("addMemoirChapterBtn");
  const hint = document.querySelector("[data-autosave-hint]");

  if (titleInput && draft.title) titleInput.value = draft.title;

  function getChapterEls() {
    return [...chaptersList.querySelectorAll("[data-memoir-chapter]")];
  }

  function persistDraft() {
    const els = getChapterEls();
    const data = {
      title: titleInput?.value || "",
      chapters: els.map((el, i) => ({
        dateLabel: el.querySelector("[data-chapter-date]")?.value?.trim()
          || el.querySelector("[data-chapter-date]")?.textContent?.trim()
          || "",
        text: el.querySelector("[data-chapter-text]")?.value || "",
        photos: draft.chapters[i]?.photos || [],
      })),
    };
    MemoirStorage.save(slug, data);
    draft = data;
    if (hint) {
      const now = new Date();
      const t = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      hint.textContent = `✓ 已于 ${t} 自动保存至草稿`;
    }
  }

  function bindCharCounter(ta) {
    const countEl = ta.closest(".input-card")?.querySelector(".input-card__count");
    if (!countEl || ta.dataset.counterBound) return;
    ta.dataset.counterBound = "1";
    const max = ta.maxLength || 100;
    const update = () => { countEl.textContent = `${ta.value.length}/${max}字`; };
    ta.addEventListener("input", update);
    update();
  }

  function renderChapterPhotos(chapterEl, index) {
    const row = chapterEl.querySelector("[data-media-row]");
    const photos = draft.chapters[index]?.photos || [];
    if (!row) return;

    row.querySelectorAll(".media-preview").forEach((n) => n.remove());
    const addBtn = row.querySelector("[data-action=add-photo]");

    photos.forEach((src, photoIdx) => {
      const wrap = document.createElement("div");
      wrap.className = "media-preview";
      wrap.innerHTML = `<img class="media-preview__img" src="${src}" alt=""><button type="button" class="media-preview__remove" aria-label="删除">×</button>`;
      wrap.querySelector(".media-preview__remove").addEventListener("click", () => {
        const ch = draft.chapters[index]?.photos || [];
        ch.splice(photoIdx, 1);
        draft.chapters[index] = { ...draft.chapters[index], photos: ch };
        persistDraft();
        renderChapterPhotos(chapterEl, index);
        showToast("已移除照片", "info");
      });
      row.insertBefore(wrap, addBtn);
    });

    if (addBtn) addBtn.style.display = photos.length >= MAX_CHAPTER_PHOTOS ? "none" : "";
  }

  function bindChapter(chapterEl, index) {
    if (chapterEl.dataset.bound) return;
    chapterEl.dataset.bound = "1";

    if (!draft.chapters[index]) draft.chapters[index] = { dateLabel: "XX年XX月", text: "", photos: [] };

    const dateEl = chapterEl.querySelector("[data-chapter-date]");
    const textEl = chapterEl.querySelector("[data-chapter-text]");
    const fileInput = chapterEl.querySelector(".memoir-photo-input");

    if (dateEl && draft.chapters[index].dateLabel) {
      if ("value" in dateEl) dateEl.value = draft.chapters[index].dateLabel;
      else dateEl.textContent = draft.chapters[index].dateLabel;
      dateEl.classList.add("chapter-head__date-input--custom");
    }
    if (textEl && draft.chapters[index].text) textEl.value = draft.chapters[index].text;
    if (textEl) bindCharCounter(textEl);

    renderChapterPhotos(chapterEl, index);

    function saveChapterDate() {
      const val = (dateEl?.value || "").trim();
      if (!val) return;
      dateEl.classList.add("chapter-head__date-input--custom");
      draft.chapters[index].dateLabel = val;
      persistDraft();
    }

    dateEl?.addEventListener("input", () => {
      clearTimeout(dateEl._saveTimer);
      dateEl._saveTimer = setTimeout(saveChapterDate, 400);
    });

    dateEl?.addEventListener("blur", saveChapterDate);

    chapterEl.querySelector("[data-action=edit-chapter-title]")?.addEventListener("click", () => {
      dateEl?.focus();
      dateEl?.select();
    });

    chapterEl.querySelector("[data-action=add-photo]")?.addEventListener("click", () => fileInput?.click());

    fileInput?.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      fileInput.value = "";
      if (!file) return;
      const photos = draft.chapters[index]?.photos || [];
      if (photos.length >= MAX_CHAPTER_PHOTOS) {
        showToast(`最多添加 ${MAX_CHAPTER_PHOTOS} 张照片`, "error");
        return;
      }
      try {
        const dataUrl = await readImageFile(file);
        photos.push(dataUrl);
        draft.chapters[index] = { ...draft.chapters[index], photos };
        persistDraft();
        renderChapterPhotos(chapterEl, index);
        showToast("照片已添加", "success");
      } catch (err) {
        showToast(err.message || "上传失败", "error");
      }
    });

    textEl?.addEventListener("input", () => {
      clearTimeout(textEl._saveTimer);
      textEl._saveTimer = setTimeout(persistDraft, 500);
    });
  }

  async function createChapterElement() {
    if (typeof ComponentLoader === "undefined") return null;
    const html = await ComponentLoader.render("memoir-chapter-input", { dateLabel: "XX年XX月" });
    const tmp = document.createElement("div");
    tmp.innerHTML = html.trim();
    return tmp.firstElementChild;
  }

  async function appendChapter(notify) {
    const chapterEl = await createChapterElement();
    if (!chapterEl) return;

    chaptersList.appendChild(chapterEl);

    const index = getChapterEls().length - 1;
    draft.chapters[index] = { dateLabel: "XX年XX月", text: "", photos: [] };
    bindChapter(chapterEl, index);
    persistDraft();

    if (notify) {
      showToast("已添加新篇章", "success");
      chapterEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  async function initChapters() {
    const savedCount = draft.chapters?.length || 0;
    const targetCount = Math.max(savedCount, getChapterEls().length);

    while (getChapterEls().length < targetCount) {
      await appendChapter(false);
    }

    getChapterEls().forEach((el, i) => bindChapter(el, i));
  }

  initChapters();

  addChapterBtn?.addEventListener("click", () => appendChapter(true));

  titleInput?.addEventListener("input", () => {
    clearTimeout(titleInput._saveTimer);
    titleInput._saveTimer = setTimeout(persistDraft, 500);
  });

  document.querySelector("[data-action=memoir-save]")?.addEventListener("click", () => {
    persistDraft();
    const title = (titleInput?.value || "").trim();
    if (!title) {
      showToast("请填写回忆录标题", "error");
      titleInput?.focus();
      return;
    }
    const meta = getMemoirTemplateMeta(slug);
    const card = MemoirStorage.saveMemoir(slug, draft, meta, editingMemoirId);
    if (!card) return;
    showToast(editingMemoirId ? "回忆录已更新" : "回忆录已保存", "success");
    setTimeout(() => {
      window.location.href = editingMemoirId
        ? `${meta.viewPage}?id=${encodeURIComponent(card.id)}`
        : "home.html";
    }, 400);
  });

  document.querySelector("[data-action=memoir-export]")?.addEventListener("click", () => {
    persistDraft();
    showToast("正在导出回忆录…", "info");
    setTimeout(() => showToast("导出成功，已保存为 PDF", "success"), 1200);
  });

  document.querySelector("[data-action=memoir-collaborate]")?.addEventListener("click", () => {
    showToast("协作邀请链接已复制", "success");
  });
}

function renderMemoirCards(memoirs, from = "home") {
  return memoirs.map((memoir) => {
    const href = `${memoir.viewPage}?id=${encodeURIComponent(memoir.id)}&from=${encodeURIComponent(from)}`;
    const cardTitle = memoir.templateLabel || "回忆录";
    const innerTitle = memoir.title || "未命名回忆录";
    const description = memoir.description || "暂无描述";
    const img = memoir.coverImage || getMemoirTemplateMeta(memoir.slug).defaultImg;
    return `<a class="memoir-card" href="${href}">
      <h3 class="memoir-card__title">${escapeHtml(cardTitle)}</h3>
      <div class="memoir-card__inner">
        <img class="memoir-card__thumb" src="${img}" alt="${escapeHtml(innerTitle)}">
        <div class="memoir-card__text">
          <strong>${escapeHtml(innerTitle)}</strong>
          ${escapeHtml(description)}
        </div>
      </div>
      <div class="memoir-card__more">了解详情 &gt;</div>
    </a>`;
  }).join("");
}

function initMemoirHome() {
  const container = document.getElementById("userMemoirList");
  if (!container) return;

  const memoirs = MemoirStorage.listSaved();
  if (!memoirs.length) {
    container.innerHTML = '<p class="memoir-empty-hint">暂无回忆录，从上方热门模板开始创建吧</p>';
    return;
  }

  container.innerHTML = renderMemoirCards(memoirs.slice(0, 3), "home");
}

function initMemoirList() {
  const container = document.getElementById("memoirFullList");
  if (!container) return;

  const memoirs = MemoirStorage.listSaved();
  if (!memoirs.length) {
    container.innerHTML = '<p class="memoir-empty-hint">暂无回忆录，从热门模板开始创建吧</p>';
    return;
  }

  container.innerHTML = renderMemoirCards(memoirs, "memoir-list");
}

function renderMemoirViewItem(chapter, index, placeholderImg) {
  const reverseClass = index % 2 === 1 ? "story-item--reverse" : "";
  const photos = chapter.photos || [];
  const imgs = [0, 1, 2].map((i) => photos[i] || placeholderImg);
  return `<div class="story-item ${reverseClass}">
    <div class="photo-stack">
      ${imgs.map((src) => `<img class="photo-stack__img" src="${src}" alt="">`).join("")}
    </div>
    <div class="story-item__text">
      <h3 class="story-item__title">${escapeHtml(chapter.dateLabel || "XX年XX月")}</h3>
      <p class="story-item__desc">${escapeHtml(chapter.text || "暂无描述")}</p>
    </div>
  </div>`;
}

function ensureMemoirViewHeaderButtons() {
  const actions = document.querySelector(".story-view-header__actions");
  if (!actions) return { editBtn: null, deleteBtn: null };

  let editBtn = document.getElementById("memoirViewEditBtn");
  let deleteBtn = document.getElementById("memoirViewDeleteBtn");

  if (!editBtn) {
    editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "story-view-header__edit";
    editBtn.id = "memoirViewEditBtn";
    editBtn.textContent = "编辑";
    actions.prepend(editBtn);
  }

  if (!deleteBtn) {
    deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "story-view-header__delete";
    deleteBtn.id = "memoirViewDeleteBtn";
    deleteBtn.textContent = "删除";
    const shareBtn = actions.querySelector(".story-view-header__share");
    if (shareBtn) shareBtn.before(deleteBtn);
    else actions.appendChild(deleteBtn);
  }

  editBtn.hidden = false;
  deleteBtn.hidden = false;
  return { editBtn, deleteBtn };
}

function bindMemoirViewActions(memoir, id) {
  const goEdit = () => {
    window.location.href = `${memoir.slug}.html?edit=${encodeURIComponent(memoir.id)}`;
  };

  const goDelete = async () => {
    const ok = await showConfirm({
      message: `确定删除「${memoir.title || "这篇回忆录"}」吗？`,
      confirmText: "删除",
      cancelText: "取消",
      danger: true,
    });
    if (ok && MemoirStorage.deleteSaved(id)) {
      showToast("回忆录已删除", "success");
      setTimeout(() => { window.location.href = getMemoirViewReturnHref(); }, 400);
    }
  };

  const { editBtn, deleteBtn } = ensureMemoirViewHeaderButtons();
  editBtn?.addEventListener("click", goEdit);
  deleteBtn?.addEventListener("click", goDelete);
}

function initMemoirView() {
  const content = document.getElementById("memoirViewContent");
  if (!content) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  const memoir = MemoirStorage.getSaved(id);
  if (!memoir) {
    showToast("回忆录不存在或已被删除", "error");
    return;
  }

  const backLink = document.querySelector(".story-view-header__back");
  if (backLink) backLink.href = getMemoirViewReturnHref();

  const meta = getMemoirTemplateMeta(memoir.slug);
  const headerTitle = document.querySelector(".story-view-header__title");
  if (headerTitle) headerTitle.textContent = memoir.templateLabel || meta.label;

  const placeholderImg = meta.defaultImg;
  const chapters = memoir.chapters?.length
    ? memoir.chapters
    : [{ dateLabel: "XX年XX月", text: memoir.description || "", photos: [] }];

  content.innerHTML = chapters
    .map((chapter, index) => renderMemoirViewItem(chapter, index, placeholderImg))
    .join("");

  bindMemoirViewActions(memoir, id);
}

  function initBottomNav() {
    if (window.XueWuyaNav) {
      const active = document.body.getAttribute("data-active-module") || "chuanjia";
      XueWuyaNav.initBottomNav(active);
    }
  }

function initGlobalButtons() {
  document.querySelectorAll(".story-create-header__export, .detail-title-row__export").forEach((btn) => {
    btn.addEventListener("click", () => {
      showToast("正在导出…", "info");
      setTimeout(() => showToast("导出成功", "success"), 1000);
    });
  });

  document.querySelectorAll(".btn-edit").forEach((btn) => {
    if (btn.id === "btnMsgEdit") return;
    btn.addEventListener("click", () => {
      const card = btn.closest(".detail-main-card");
      const textEl = card?.querySelector(".detail-main-card__text");
      if (textEl) {
        textEl.contentEditable = "true";
        textEl.classList.remove("detail-main-card__text--placeholder");
        textEl.focus();
        showToast("已进入编辑模式", "info");
      }
    });
  });

}

const MESSAGE_SAMPLE_TEXTS = [
  "周末回来吃饭，妈做了你最爱的红烧肉。",
  "照片里大家都在笑，那天的阳光也很好。",
  "记得那年冬天，奶奶总把热水袋放在你被窝里。",
  "爸说后院的花开了，等你回来一起拍照。",
  "把老相册翻了一遍，每一张都想讲给你听。",
  "今天是你生日，全家人给你录了祝福视频。",
  "刚才在旧箱子里找到你小时候写的明信片。",
  "妹妹说下次聚会要带着新做的甜点来。",
  "外公身体恢复得不错，下周全家去看他。",
  "整理老照片时发现，你笑起来眼睛像爷爷。",
  "妈刚刚还念叨你，说想听听你最近过得怎么样。",
  "翻到了一张全家福，决定下次聚会再拍一张。",
];

const MESSAGE_FAMILY_AVATARS = (window.XueWuyaAvatars && window.XueWuyaAvatars.all) || [
  "https://images.unsplash.com/photo-1557862921-37829c790f19?w=200&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80",
];

const MESSAGE_PREVIEW_AVATARS = MESSAGE_FAMILY_AVATARS.slice(0, 3);

function applyChuanjiaFamilyAvatars() {
  const avatars = window.XueWuyaAvatars;
  if (!avatars) return;
  document.querySelectorAll(".family-avatars__item").forEach((img, i) => {
    if (avatars.all[i]) img.src = avatars.all[i];
  });
  document.querySelectorAll(".msg-create-card__avatar, #detailMsgAvatar").forEach((el) => {
    el.src = avatars.self;
  });
  const familyRoles = [avatars.wife, avatars.daughter, avatars.sonInLaw, avatars.self, avatars.member5, avatars.member6];
  document.querySelectorAll(".family-item__avatar").forEach((img, i) => {
    if (familyRoles[i]) img.src = familyRoles[i];
  });
}

function initMessageHomePreview() {
  const chat = document.getElementById("msgPreviewChat");
  if (!chat) return;

  const messages = MessageStorage.loadMessages();
  chat.innerHTML = ["0", "1", "2"].map((index, i) => {
    const msg = messages[index];
    const rightClass = i === 1 ? " msg-preview__row--right" : "";
    const avatar = MESSAGE_PREVIEW_AVATARS[i % MESSAGE_PREVIEW_AVATARS.length];
    return `<div class="msg-preview__row${rightClass}">
      <img class="msg-preview__avatar" src="${avatar}" alt="">
      <div class="msg-preview__bubble">${escapeHtml(msg?.content || "")}</div>
    </div>`;
  }).join("");
}

function initMessageViewMore() {
  const btn = document.getElementById("btnMsgViewMore");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const section = Math.floor(Math.random() * 6);
    window.location.href = `list.html?section=${section}`;
  });
}

const MESSAGE_LIST_CACHE_KEY = "chuanjialu_msg_list";
const MESSAGE_REPLIES_KEY = "chuanjialu_msg_replies";
const MESSAGE_USER_AVATAR = (window.XueWuyaAvatars && window.XueWuyaAvatars.self) ||
  "https://images.unsplash.com/photo-1557862921-37829c790f19?w=200&q=80";
const MESSAGE_DEFAULT_AVATAR = MESSAGE_FAMILY_AVATARS[0];

const MESSAGE_DEFAULT_META = [
  { avatar: MESSAGE_FAMILY_AVATARS[0], time: "2026/04/30 20:05", pinned: true },
  { avatar: MESSAGE_FAMILY_AVATARS[1], time: "2026/04/28 18:20", pinned: true },
  { avatar: MESSAGE_FAMILY_AVATARS[2], time: "2026/04/25 09:15", pinned: true },
  { avatar: MESSAGE_FAMILY_AVATARS[3], time: "2026/04/22 14:40", pinned: false },
  { avatar: MESSAGE_FAMILY_AVATARS[4], time: "2026/04/20 11:08", pinned: false },
  { avatar: MESSAGE_FAMILY_AVATARS[5], time: "2026/04/18 16:55", pinned: false },
];

function isLegacyMessageAvatar(url) {
  if (!url) return true;
  if (url.startsWith("data:")) return false;
  const known = window.XueWuyaAvatars && window.XueWuyaAvatars.all;
  if (known && known.includes(url)) return false;
  if (url.includes("randomuser.me")) return true;
  if (url.includes("images.unsplash.com")) return true;
  return false;
}

function migrateMessageAvatars(messages) {
  let changed = false;
  MESSAGE_DEFAULT_META.forEach((meta, i) => {
    const key = String(i);
    const msg = messages[key];
    if (msg && !msg.userCreated && msg.avatar !== meta.avatar) {
      msg.avatar = meta.avatar;
      changed = true;
    }
  });
  Object.values(messages).forEach((msg, i) => {
    if (isLegacyMessageAvatar(msg.avatar)) {
      msg.avatar = msg.userCreated
        ? MESSAGE_USER_AVATAR
        : MESSAGE_FAMILY_AVATARS[i % MESSAGE_FAMILY_AVATARS.length];
      changed = true;
    }
  });
  return changed;
}

const MessageStorage = {
  getDefaultMessages() {
    const messages = {};
    MESSAGE_DEFAULT_META.forEach((meta, i) => {
      messages[String(i)] = {
        content: MESSAGE_SAMPLE_TEXTS[i] || MESSAGE_SAMPLE_TEXTS[0],
        avatar: meta.avatar,
        time: meta.time,
        pinned: meta.pinned,
        userCreated: false,
      };
    });
    return messages;
  },

  loadMessages() {
    try {
      const saved = JSON.parse(localStorage.getItem(MESSAGE_LIST_CACHE_KEY));
      if (saved && Object.keys(saved).length >= MESSAGE_DEFAULT_META.length) {
        if (migrateMessageAvatars(saved)) {
          this.saveMessages(saved);
        }
        return saved;
      }
    } catch {
      /* ignore */
    }
    const seeded = this.getDefaultMessages();
    this.saveMessages(seeded);
    return seeded;
  },

  saveMessages(messages) {
    localStorage.setItem(MESSAGE_LIST_CACHE_KEY, JSON.stringify(messages));
  },

  getMessage(index) {
    const messages = this.loadMessages();
    return messages[String(index)] || messages["0"];
  },

  updateMessage(id, content) {
    const messages = this.loadMessages();
    const msg = messages[String(id)];
    if (!msg?.userCreated) return false;
    msg.content = content.trim();
    this.saveMessages(messages);
    return true;
  },

  deleteMessage(id) {
    const messages = this.loadMessages();
    if (!messages[String(id)]?.userCreated) return false;
    delete messages[String(id)];
    this.saveMessages(messages);

    let all = {};
    try {
      all = JSON.parse(localStorage.getItem(MESSAGE_REPLIES_KEY)) || {};
    } catch {
      all = {};
    }
    delete all[String(id)];
    localStorage.setItem(MESSAGE_REPLIES_KEY, JSON.stringify(all));
    return true;
  },

  addMessage(message) {
    const messages = this.loadMessages();
    const id = `m${Date.now()}`;
    messages[id] = {
      content: message.content,
      avatar: message.avatar || MESSAGE_USER_AVATAR,
      time: message.time || formatMessageTime(),
      pinned: false,
      userCreated: true,
    };
    this.saveMessages(messages);
    return id;
  },

  loadReplies(index) {
    try {
      const all = JSON.parse(localStorage.getItem(MESSAGE_REPLIES_KEY)) || {};
      const raw = all[String(index)] || [];
      const normalized = normalizeReplies(raw);
      if (raw.some((reply) => !reply.id || !Array.isArray(reply.children)) || repliesNeedMigration(raw)) {
        this.saveReplies(index, normalized);
      }
      return normalized;
    } catch {
      return [];
    }
  },

  saveReplies(index, replies) {
    let all = {};
    try {
      all = JSON.parse(localStorage.getItem(MESSAGE_REPLIES_KEY)) || {};
    } catch {
      all = {};
    }
    all[String(index)] = replies;
    localStorage.setItem(MESSAGE_REPLIES_KEY, JSON.stringify(all));
  },

  addReply(index, reply, parentId = null) {
    const replies = this.loadReplies(index);
    const newReply = {
      id: generateReplyId(),
      text: reply.text,
      time: reply.time,
      avatar: reply.avatar || MESSAGE_USER_AVATAR,
      userCreated: true,
      children: [],
    };

    if (parentId) {
      const parent = findReplyById(replies, parentId);
      if (parent) parent.children.push(newReply);
      else replies.push(newReply);
    } else {
      replies.push(newReply);
    }

    this.saveReplies(index, replies);
    return newReply;
  },

  updateReply(index, replyId, text) {
    const replies = this.loadReplies(index);
    const reply = findReplyById(replies, replyId);
    if (!reply || reply.userCreated === false) return false;
    reply.text = text.trim();
    this.saveReplies(index, replies);
    return true;
  },

  deleteReply(index, replyId) {
    const replies = this.loadReplies(index);
    if (!removeReplyById(replies, replyId)) return false;
    this.saveReplies(index, replies);
    return true;
  },
};

function generateReplyId() {
  return `r${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function repliesNeedMigration(replies) {
  return (replies || []).some((reply) =>
    isLegacyMessageAvatar(reply.avatar) || repliesNeedMigration(reply.children)
  );
}

function normalizeReplies(replies) {
  return (replies || []).map((reply) => ({
    id: reply.id || generateReplyId(),
    text: reply.text || "",
    time: reply.time || "",
    avatar: isLegacyMessageAvatar(reply.avatar) ? MESSAGE_USER_AVATAR : (reply.avatar || MESSAGE_USER_AVATAR),
    userCreated: reply.userCreated !== false,
    children: normalizeReplies(reply.children || []),
  }));
}

function findReplyById(replies, id) {
  for (const reply of replies) {
    if (reply.id === id) return reply;
    const nested = findReplyById(reply.children || [], id);
    if (nested) return nested;
  }
  return null;
}

function removeReplyById(replies, id) {
  for (let i = 0; i < replies.length; i++) {
    if (replies[i].id === id) {
      if (replies[i].userCreated === false) return false;
      replies.splice(i, 1);
      return true;
    }
    if (removeReplyById(replies[i].children || [], id)) return true;
  }
  return false;
}

function formatMessageTime(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function renderReplyThread(reply) {
  const childrenHtml = (reply.children || []).map((child) => renderReplyThread(child)).join("");
  const owned = reply.userCreated !== false;
  const manageActions = owned
    ? `<button type="button" class="reply-card__edit-btn" data-reply-id="${reply.id}">编辑</button>
       <button type="button" class="reply-card__delete-btn" data-reply-id="${reply.id}">删除</button>`
    : "";
  return `<div class="reply-thread" data-reply-id="${reply.id}">
    <div class="reply-card">
      <img class="reply-card__avatar" src="${reply.avatar || MESSAGE_USER_AVATAR}" alt="">
      <div class="reply-card__body">
        <div class="reply-card__text">${escapeHtml(reply.text)}</div>
        <div class="reply-card__meta">
          <span class="reply-card__time">${escapeHtml(reply.time)}</span>
          <div class="reply-card__actions">
            <button type="button" class="reply-card__reply-btn" data-reply-id="${reply.id}">回复</button>
            ${manageActions}
          </div>
        </div>
      </div>
    </div>
    ${childrenHtml ? `<div class="reply-thread__children">${childrenHtml}</div>` : ""}
  </div>`;
}

function getOrderedMessageEntries() {
  const messages = MessageStorage.loadMessages();
  const entries = Object.entries(messages).map(([id, msg]) => ({ id, ...msg }));
  const pinned = entries.filter((entry) => entry.pinned).sort((a, b) => Number(a.id) - Number(b.id));
  const userCreated = entries.filter((entry) => entry.userCreated).sort((a, b) => b.id.localeCompare(a.id));
  const others = entries.filter((entry) => !entry.pinned && !entry.userCreated).sort((a, b) => Number(a.id) - Number(b.id));
  return [...pinned, ...userCreated, ...others];
}

function renderMessageListCard(entry) {
  const pinClass = entry.pinned ? " msg-card--pinned" : "";
  const pinHtml = entry.pinned ? '<span class="msg-card__pin">⇡ 置顶</span>' : "";
  return `<a class="msg-card${pinClass}" href="detail.html?index=${encodeURIComponent(entry.id)}" data-msg-index="${entry.id}">
    <img class="msg-card__avatar" src="${entry.avatar || MESSAGE_DEFAULT_AVATAR}" alt="">
    <div class="msg-card__content">${escapeHtml(entry.content)}</div>
    ${pinHtml}
    <span class="msg-card__time">${escapeHtml(entry.time)}</span>
  </a>`;
}

function initMessageListPage() {
  const root = document.getElementById("msgListRoot");
  if (!root) return;

  const ordered = getOrderedMessageEntries();
  root.innerHTML = ordered.map((entry) => renderMessageListCard(entry)).join("");

  const params = new URLSearchParams(window.location.search);
  const newId = params.get("new");
  const section = params.get("section");
  const scrollTargetId = newId ?? section;

  if (scrollTargetId !== null) {
    const target = root.querySelector(`[data-msg-index="${scrollTargetId}"]`);
    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }
}

function initMessageDetail() {
  const page = document.querySelector(".page--msg-detail");
  if (!page) return;

  const params = new URLSearchParams(window.location.search);
  const index = params.get("index") ?? "0";
  const msg = MessageStorage.getMessage(index);

  const textEl = document.getElementById("detailMsgText");
  const avatarEl = document.getElementById("detailMsgAvatar");
  const timeEl = document.getElementById("detailMsgTime");
  if (textEl) textEl.textContent = msg.content;
  if (avatarEl) {
    avatarEl.src = msg.avatar;
    avatarEl.alt = "留言用户";
  }
  if (timeEl) timeEl.textContent = msg.time;

  const editBtn = document.getElementById("btnMsgEdit");
  const deleteBtn = document.getElementById("btnDeleteMsg");
  const isOwnMessage = !!msg.userCreated;

  if (editBtn) editBtn.hidden = !isOwnMessage;
  if (deleteBtn) deleteBtn.hidden = !isOwnMessage;

  editBtn?.addEventListener("click", () => {
    if (!isOwnMessage || !textEl) return;
    textEl.contentEditable = "true";
    textEl.focus();
    showToast("已进入编辑模式", "info");
  });

  textEl?.addEventListener("blur", () => {
    if (!isOwnMessage || !textEl || textEl.contentEditable !== "true") return;
    textEl.contentEditable = "false";
    const content = textEl.textContent.trim();
    if (!content) {
      textEl.textContent = msg.content;
      showToast("留言内容不能为空", "error");
      return;
    }
    if (MessageStorage.updateMessage(index, content)) {
      msg.content = content;
      showToast("留言已更新", "success");
    }
  });

  deleteBtn?.addEventListener("click", async () => {
    if (!isOwnMessage) return;
    const ok = await showConfirm({
      message: "确定删除这条留言吗？",
      confirmText: "删除",
      cancelText: "取消",
      danger: true,
    });
    if (ok && MessageStorage.deleteMessage(index)) {
      showToast("留言已删除", "success");
      setTimeout(() => { window.location.href = "list.html"; }, 400);
    }
  });

  const replyOverlay = document.getElementById("replyOverlay");
  const replyInput = document.getElementById("replyInput");
  const replyList = document.getElementById("replyList");
  const replyBtn = document.getElementById("btnReplyMsg");
  const replySheetTitle = document.getElementById("replySheetTitle");
  let replyTargetId = null;
  let replyEditId = null;

  function renderReplies() {
    if (!replyList) return;
    const replies = MessageStorage.loadReplies(index);
    replyList.innerHTML = replies.map((reply) => renderReplyThread(reply)).join("");
  }

  function openReplyOverlay(parentId = null, previewText = "", editId = null, editText = "") {
    replyTargetId = parentId;
    replyEditId = editId;
    if (replySheetTitle) {
      if (editId) replySheetTitle.textContent = "编辑回复";
      else replySheetTitle.textContent = parentId ? "回复评论" : "回复留言";
    }
    replyOverlay?.classList.add("overlay--visible");
    document.body.classList.add("modal-open");
    if (replyInput) {
      replyInput.value = editId ? editText : "";
      replyInput.placeholder = editId
        ? "编辑回复内容…"
        : previewText
          ? `回复：${previewText.slice(0, 24)}${previewText.length > 24 ? "…" : ""}`
          : "写下你的回复…";
      setTimeout(() => replyInput.focus(), 120);
    }
  }

  function closeReplyOverlay() {
    replyTargetId = null;
    replyEditId = null;
    replyOverlay?.classList.remove("overlay--visible");
    document.body.classList.remove("modal-open");
    if (replyInput) replyInput.placeholder = "写下你的回复…";
    if (replySheetTitle) replySheetTitle.textContent = "回复留言";
  }

  function appendReply(text, parentId = null) {
    MessageStorage.addReply(index, {
      text,
      time: formatMessageTime(),
      avatar: MESSAGE_USER_AVATAR,
    }, parentId);
    renderReplies();
  }

  renderReplies();

  replyBtn?.addEventListener("click", () => {
    const delay = 120 + Math.floor(Math.random() * 380);
    setTimeout(() => openReplyOverlay(), delay);
  });

  replyList?.addEventListener("click", async (e) => {
    const editBtnEl = e.target.closest(".reply-card__edit-btn");
    const deleteBtnEl = e.target.closest(".reply-card__delete-btn");
    const replyBtnEl = e.target.closest(".reply-card__reply-btn");

    if (editBtnEl) {
      const text = editBtnEl.closest(".reply-thread")?.querySelector(".reply-card__text")?.textContent?.trim() || "";
      openReplyOverlay(null, "", editBtnEl.dataset.replyId, text);
      return;
    }

    if (deleteBtnEl) {
      const ok = await showConfirm({
        message: "确定删除这条回复吗？",
        confirmText: "删除",
        cancelText: "取消",
        danger: true,
      });
      if (ok && MessageStorage.deleteReply(index, deleteBtnEl.dataset.replyId)) {
        renderReplies();
        showToast("回复已删除", "success");
      }
      return;
    }

    if (!replyBtnEl) return;
    const previewText = replyBtnEl.closest(".reply-thread")?.querySelector(".reply-card__text")?.textContent?.trim() || "";
    const delay = 120 + Math.floor(Math.random() * 380);
    setTimeout(() => openReplyOverlay(replyBtnEl.dataset.replyId, previewText), delay);
  });

  document.getElementById("replyCancel")?.addEventListener("click", closeReplyOverlay);

  document.getElementById("replyConfirm")?.addEventListener("click", () => {
    const text = (replyInput?.value || "").trim();
    if (!text) {
      showToast(replyEditId ? "请输入回复内容" : "请输入回复内容", "error");
      replyInput?.focus();
      return;
    }
    if (replyEditId) {
      if (MessageStorage.updateReply(index, replyEditId, text)) {
        renderReplies();
        showToast("回复已更新", "success");
      }
    } else {
      appendReply(text, replyTargetId);
      showToast("回复已发送", "success");
    }
    closeReplyOverlay();
  });

  replyOverlay?.addEventListener("click", (e) => {
    if (e.target === replyOverlay) closeReplyOverlay();
  });
}

const MESSAGE_CREATE_PLACEHOLDER = "写下你对家人想说的话";

function initMessagePublishForm() {
  const publishInput = document.getElementById("publishInput");
  if (!publishInput) return;

  function isPlaceholder() {
    return publishInput.textContent.trim() === MESSAGE_CREATE_PLACEHOLDER;
  }

  function clearPlaceholder() {
    if (isPlaceholder()) {
      publishInput.textContent = "";
      publishInput.classList.remove("detail-main-card__text--placeholder");
    }
  }

  function restorePlaceholder() {
    if (!publishInput.textContent.trim()) {
      publishInput.textContent = MESSAGE_CREATE_PLACEHOLDER;
      publishInput.classList.add("detail-main-card__text--placeholder");
    }
  }

  publishInput.addEventListener("focus", clearPlaceholder);
  publishInput.addEventListener("input", () => {
    if (publishInput.textContent.trim()) {
      publishInput.classList.remove("detail-main-card__text--placeholder");
    }
  });
  publishInput.addEventListener("blur", restorePlaceholder);
}

function initMessageBoard() {
  applyChuanjiaFamilyAvatars();
  initMessageHomePreview();
  initMessageViewMore();
  initMessageListPage();
  initMessageDetail();

  const searchInput = document.getElementById("msgSearchInput");
  const msgListRoot = document.getElementById("msgListRoot");
  if (searchInput && msgListRoot) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      const cards = [...msgListRoot.querySelectorAll(".msg-card")];
      let visible = 0;
      cards.forEach((card) => {
        const text = card.querySelector(".msg-card__content")?.textContent.toLowerCase() || "";
        const show = !q || text.includes(q);
        card.style.display = show ? "" : "none";
        if (show) visible++;
      });
      if (q && visible === 0) showToast("未找到相关留言", "info");
    });
  }

  document.getElementById("btnPublish")?.addEventListener("click", () => {
    const el = document.getElementById("publishInput");
    const text = el?.textContent.trim();
    if (!text || text === MESSAGE_CREATE_PLACEHOLDER) {
      showToast("请输入留言内容", "error");
      el?.focus();
      return;
    }
    const id = MessageStorage.addMessage({
      content: text,
      avatar: MESSAGE_USER_AVATAR,
      time: formatMessageTime(),
    });
    showToast("留言已发布", "success");
    setTimeout(() => {
      window.location.href = `list.html?new=${encodeURIComponent(id)}`;
    }, 400);
  });

  document.getElementById("btnPinMsg")?.addEventListener("click", () => {
    showToast("已置顶", "success");
  });

  document.getElementById("btnSearchMsg")?.addEventListener("click", () => {
    searchInput?.dispatchEvent(new Event("input"));
    if (!searchInput?.value.trim()) showToast("请输入搜索关键词", "info");
  });

  initMessagePublishForm();
}

function initShareButtons() {
  document.querySelectorAll(".story-view-header__share").forEach((btn) => {
    btn.addEventListener("click", () => {
      showToast("分享链接已复制到剪贴板", "success");
    });
  });
}

function initInteractions(config) {
  if (window.XueWuyaAuth && XueWuyaAuth.isGuest()) {
    var root = document.querySelector(".phone") || document.body;
    XueWuyaAuth.guardGuestInteractions(root);
    return;
  }
  initHeroCarousel();
  initStoryCardForm();
  initStoryCardPhotoUpload();
  initStoryCardList();
  initStoryCardDetail();
  initMemoirEditor();
  initMemoirHome();
  initMemoirList();
  initMemoirView();
  initGlobalButtons();
  initBottomNav();
  initMessageBoard();
  initShareButtons();

  if (config?.subForm === "mood") initStoryCardSubForm("mood");
  if (config?.subForm === "desc") initStoryCardSubForm("description");
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.PAGE_CONFIG) {
    document.addEventListener("pageReady", () => initInteractions(window.PAGE_CONFIG));
  }
});
