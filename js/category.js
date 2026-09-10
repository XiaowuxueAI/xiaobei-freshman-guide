/* 攻略站点页：搜索过滤 + 深链展开。无依赖。 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    var form = document.querySelector("[data-search]");
    var input = document.querySelector("[data-search-input]");
    var status = document.querySelector("[data-search-status]");
    var empty = document.querySelector("[data-search-empty]");
    var resetButton = document.querySelector("[data-search-reset]");
    var list = document.querySelector("[data-station-list]");
    if (!input || !list) return;

    var stations = Array.prototype.slice.call(list.querySelectorAll(".station"));
    var phases = Array.prototype.slice.call(list.querySelectorAll("[data-phase]"));

    function haystack(station) {
      var tags = station.getAttribute("data-tags") || "";
      return (tags + " " + station.textContent).replace(/\s+/g, " ").toLowerCase();
    }

    stations.forEach(function (station) {
      station.dataset.hay = haystack(station);
    });

    function apply(query) {
      var needle = (query || "").trim().toLowerCase();
      var shown = 0;

      stations.forEach(function (station) {
        var match = !needle || station.dataset.hay.indexOf(needle) !== -1;
        station.hidden = !match;
        if (match) shown += 1;
      });

      phases.forEach(function (phase) {
        var visible = Array.prototype.some.call(phase.querySelectorAll(".station"), function (station) {
          return !station.hidden;
        });
        phase.hidden = !visible;
      });

      if (status) {
        status.textContent = needle
          ? "找到 " + shown + " 个站点。"
          : "共 " + stations.length + " 个站点。";
      }
      if (empty) empty.hidden = shown !== 0;
    }

    input.addEventListener("input", function () { apply(input.value); });

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply(input.value);
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        input.value = "";
        apply("");
        input.focus();
      });
    }

    // 从首页行程表跳进来时，直接把那一段展开
    function openFromHash() {
      var id = (window.location.hash || "").replace(/^#/, "");
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      if (target.tagName === "DETAILS") {
        target.open = true;
      } else {
        var parent = target.closest("details");
        if (parent) parent.open = true;
      }
    }

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
  });
}());
