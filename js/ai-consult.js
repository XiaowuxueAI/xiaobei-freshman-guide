/* 问询窗口：本地关键词问答。
   问题库直接从页面上的 [data-kb] 列表读取（同一份内容，页面可读、脚本可用），
   不联网、不写任何存储。 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var THRESHOLD = 8;

  var GREETING = "新同学你好，我是小北学长。报到、宿舍、军训、交通、费用、校园跑、开学清单都可以问我。";
  var FALLBACK =
    "这一句我这份本地问题库暂时没有整理到。政策口径我不敢替你猜，所以给你三条更稳的路：" +
    "一，去「攻略站点」翻对应的那一站；二，报到时间、收费、住宿这类信息以学校官方通知为准；" +
    "三，关注小北学长的抖音或微信，后续整理的更新会发在上面。";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function normalize(text) {
    return (text || "")
      .toLowerCase()
      .replace(/[\s\u3000，。？！、,.?!：:；;（）()【】\[\]“”‘’"'~\-—…·]/g, "");
  }

  function bigrams(text) {
    var out = [];
    for (var i = 0; i < text.length - 1; i += 1) out.push(text.slice(i, i + 2));
    return out;
  }

  ready(function () {
    var log = document.querySelector("[data-chat-log]");
    var form = document.querySelector("[data-chat-form]");
    var input = document.querySelector("[data-chat-input]");
    var sendButton = document.querySelector("[data-chat-send]");
    var clearButton = document.querySelector("[data-chat-clear]");
    if (!log || !form || !input) return;

    /* ---------------------------------------------------------- 问题库 */
    var entries = Array.prototype.slice.call(document.querySelectorAll("[data-kb]")).map(function (node, index) {
      var questionNode = node.querySelector(".kb__q span");
      var answerNode = node.querySelector(".kb__a p");
      var question = questionNode ? questionNode.textContent.trim() : "";
      var answer = answerNode ? answerNode.textContent.trim() : "";
      var keywords = (node.getAttribute("data-kw") || "")
        .split(",")
        .map(function (word) { return normalize(word); })
        .filter(Boolean);
      return {
        index: index,
        question: question,
        answer: answer,
        keywords: keywords,
        station: node.getAttribute("data-station") || "",
        normQuestion: normalize(question),
        grams: bigrams(normalize(question))
      };
    });

    function score(entry, query) {
      if (!query) return 0;
      if (entry.normQuestion && entry.normQuestion === query) return 1000;
      var total = 0;
      entry.keywords.forEach(function (word) {
        if (query.indexOf(word) !== -1) total += word.length * 6;
        else if (word.indexOf(query) !== -1 && query.length >= 2) total += query.length * 3;
      });
      var seen = {};
      bigrams(query).forEach(function (gram) {
        if (seen[gram]) return;
        seen[gram] = 1;
        if (entry.grams.indexOf(gram) !== -1) total += 3;
      });
      return total;
    }

    function search(text) {
      var query = normalize(text);
      if (!query) return { entry: null, ranked: [] };
      var ranked = entries
        .map(function (entry) { return { entry: entry, value: score(entry, query) }; })
        .filter(function (row) { return row.value > 0; })
        .sort(function (a, b) { return b.value - a.value; });
      return {
        entry: ranked.length && ranked[0].value >= THRESHOLD ? ranked[0].entry : null,
        ranked: ranked.slice(0, 3).map(function (row) { return row.entry; })
      };
    }

    /* ------------------------------------------------------------- 渲染 */
    var busy = false;
    var lastQuestion = "";
    var streamToken = 0;

    function scrollToEnd() {
      log.scrollTop = log.scrollHeight;
    }

    function addMessage(role, text) {
      var row = document.createElement("div");
      row.className = "msg " + (role === "ask" ? "msg--ask" : "msg--ai");
      var who = document.createElement("p");
      who.className = "msg__who";
      who.textContent = role === "ask" ? "你" : "小北学长";
      var body = document.createElement("p");
      body.className = "msg__body";
      body.textContent = text;
      row.appendChild(who);
      row.appendChild(body);
      log.appendChild(row);
      scrollToEnd();
      return body;
    }

    function addLinkRow(href, label) {
      var link = document.createElement("a");
      link.className = "msg__more";
      link.href = href;
      link.textContent = label;
      log.appendChild(link);
      scrollToEnd();
    }

    function addSuggestions(list) {
      if (!list.length) return;
      // 只保留最近一组建议，避免对话里堆成一片按钮
      Array.prototype.slice.call(log.querySelectorAll("[data-suggest-row]")).forEach(function (row) {
        row.remove();
      });
      var box = document.createElement("div");
      box.className = "chat__suggests";
      box.setAttribute("data-suggest-row", "");
      list.slice(0, 3).forEach(function (entry) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "chat__suggest";
        button.setAttribute("data-ask", entry.question);
        button.textContent = entry.question;
        box.appendChild(button);
      });
      log.appendChild(box);
      scrollToEnd();
    }

    function stream(body, text, done) {
      if (reduceMotion || text.length < 16) {
        body.textContent = text;
        if (done) done();
        scrollToEnd();
        return;
      }
      var index = 0;
      body.textContent = "";
      (function tick() {
        index += 1;
        body.textContent = text.slice(0, index);
        scrollToEnd();
        if (index < text.length) window.setTimeout(tick, 16);
        else if (done) done();
      }());
    }

    function typingIndicator() {
      var wrap = document.createElement("span");
      wrap.className = "typing";
      wrap.textContent = "小北正在翻问题库…";
      return wrap;
    }

    function answer(text, station, suggestions) {
      var body = addMessage("ai", "");
      var token = streamToken;
      // 流式期间把整个 live region 标记为忙碌：读屏器等答案写完播报一次，
      // 而不是每吐一个字播报一次。
      log.setAttribute("aria-busy", "true");
      var indicator = typingIndicator();
      body.appendChild(indicator);
      scrollToEnd();

      window.setTimeout(function () {
        if (token !== streamToken) return;   // 已经被「清空对话」取消
        body.textContent = "";
        stream(body, text, function () {
          if (token !== streamToken) return;
          log.removeAttribute("aria-busy");
          if (station) addLinkRow("category.html#" + station, "看对应的攻略站点 →");
          if (suggestions && suggestions.length) addSuggestions(suggestions);
          busy = false;
          if (sendButton) sendButton.disabled = false;
          input.focus();
        });
      }, reduceMotion ? 0 : 260);
    }

    function ask(rawQuestion) {
      if (busy) return;
      var question = (rawQuestion || "").trim();
      if (!question) {
        input.focus();
        return;
      }

      lastQuestion = question;
      addMessage("ask", question);
      input.value = "";
      busy = true;
      if (sendButton) sendButton.disabled = true;

      var normalized = normalize(question);

      if (/^(你好|您好|hi|hello|嗨|在吗|学长好)/.test(normalized)) {
        answer(GREETING, "", search("宿舍").ranked);
        return;
      }
      if (/谢谢|多谢|感谢|辛苦/.test(normalized)) {
        answer("不客气。还有别的问题随时问；报到当天记得把证件放在一个文件袋里，现场会省很多时间。", "st-register", []);
        return;
      }
      if (/你是谁|你叫什么|你是不是真人/.test(normalized)) {
        answer(
          "我是小北学长整理的本地问答助手，答案来自这一页的 32 条常见问题库，不是真人，也不是学校官方回复。涉及政策的问题，我会提醒你看学校官方通知。",
          "",
          search("报到").ranked
        );
        return;
      }

      var result = search(question);
      if (result.entry) {
        var extra = result.ranked.filter(function (entry) { return entry !== result.entry; });
        answer(result.entry.answer, result.entry.station, extra.length ? extra : []);
      } else {
        answer(FALLBACK, "st-register", result.ranked.length ? result.ranked : search("报到时间").ranked);
      }
    }

    /* ------------------------------------------------------------- 绑定 */
    log.addEventListener("click", function (event) {
      var askButton = event.target.closest("[data-ask]");
      if (askButton) {
        ask(askButton.getAttribute("data-ask") || askButton.textContent);
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      ask(input.value);
    });

    Array.prototype.forEach.call(document.querySelectorAll("[data-ask-from-item]"), function (button) {
      button.addEventListener("click", function () {
        var item = button.closest("[data-kb]");
        var questionNode = item ? item.querySelector(".kb__q span") : null;
        if (questionNode) ask(questionNode.textContent.trim());
      });
    });

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        busy = false;
        streamToken += 1;           // 丢弃还在流式输出的那一条
        log.removeAttribute("aria-busy");
        if (sendButton) sendButton.disabled = false;
        Array.prototype.slice.call(log.children).forEach(function (child, index) {
          if (index === 0) return; // 保留开场白
          child.remove();
        });
        log.scrollTop = 0;
        input.value = "";
        input.focus();
      });
    }

    input.addEventListener("keydown", function (event) {
      if (event.key === "ArrowUp" && !input.value && lastQuestion) {
        event.preventDefault();
        input.value = lastQuestion;
      }
    });
  });
}());
