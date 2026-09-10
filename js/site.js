/* 小北学长 · 共享脚本
   导航、行程轴绘制、行前装包清单。无依赖，无网络请求。 */
(function () {
  "use strict";

  var PACK_KEY = "fusoft.pack.v1";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  /* ---------------------------------------------------------------- 导航 */
  function initNav() {
    var toggle = document.querySelector(".nav__toggle");
    var list = document.querySelector("[data-nav-list]");
    if (!toggle || !list) return;

    function close(returnFocus) {
      list.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener("click", function () {
      var open = list.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && list.classList.contains("is-open")) close(true);
    });

    document.addEventListener("click", function (event) {
      if (!list.classList.contains("is-open")) return;
      if (list.contains(event.target) || toggle.contains(event.target)) return;
      close(false);
    });

    list.addEventListener("click", function (event) {
      if (event.target.closest("a")) close(false);
    });
  }

  /* ------------------------------------------------------------- 行程轴 */
  function initRail() {
    var rail = document.querySelector("[data-rail]");
    if (!rail) return;

    function draw() { rail.classList.add("is-drawn"); }

    if (reduceMotion || !("IntersectionObserver" in window)) {
      draw();
      return;
    }

    rail.classList.add("is-armed");

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        draw();
        observer.disconnect();
      });
    }, { threshold: 0.2 });

    observer.observe(rail);
    // 兜底：观察器没有回调时也必须让内容出现
    window.setTimeout(draw, 1600);
  }

  /* --------------------------------------------------------- 装包清单 */
  function readPack() {
    try {
      var raw = window.localStorage.getItem(PACK_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.filter(function (id) { return typeof id === "string"; }) : [];
    } catch (error) {
      return [];
    }
  }

  function writePack(ids) {
    try {
      window.localStorage.setItem(PACK_KEY, JSON.stringify(ids));
    } catch (error) {
      /* 隐私模式或存储被禁用时静默降级：清单仍然可以勾，只是不记住 */
    }
  }

  function initPack() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-pack]"));
    var readout = document.querySelector("[data-pack-readout] b");
    var countEl = document.querySelector("[data-pack-count] b");
    var totalEl = document.querySelector("[data-pack-total]");
    var meter = document.querySelector("[data-pack-meter]");
    var doneStamp = document.querySelector("[data-pack-done]");
    var resetButton = document.querySelector("[data-pack-reset]");
    var total = boxes.length || 42;

    if (totalEl) totalEl.textContent = String(total);

    function render() {
      var checked = 0;
      boxes.forEach(function (box) { if (box.checked) checked += 1; });
      if (readout) readout.textContent = String(checked);
      if (countEl) countEl.textContent = String(checked);
      if (meter) meter.style.transform = "scaleX(" + (total ? checked / total : 0) + ")";
      if (doneStamp) doneStamp.classList.toggle("is-shown", checked === total && total > 0);
      return checked;
    }

    if (boxes.length) {
      var saved = readPack();
      boxes.forEach(function (box) {
        box.checked = saved.indexOf(box.getAttribute("data-pack")) !== -1;
        box.addEventListener("change", function () {
          var ids = boxes.filter(function (b) { return b.checked; })
            .map(function (b) { return b.getAttribute("data-pack"); });
          writePack(ids);
          render();
        });
      });
      render();
    } else {
      // 首页只有读数：从存储里算已勾选数量
      if (readout) readout.textContent = String(Math.min(readPack().length, total));
    }

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        boxes.forEach(function (box) { box.checked = false; });
        writePack([]);
        render();
        resetButton.focus();
      });
    }

    window.addEventListener("storage", function (event) {
      if (event.key !== PACK_KEY) return;
      var ids = readPack();
      boxes.forEach(function (box) {
        box.checked = ids.indexOf(box.getAttribute("data-pack")) !== -1;
      });
      render();
    });
  }

  ready(function () {
    initNav();
    initRail();
    initPack();
  });
}());
