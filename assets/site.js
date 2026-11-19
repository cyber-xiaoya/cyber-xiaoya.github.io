(function () {
  "use strict";
  var CFG = window.BILLOW_SITE || {};
  var I18N = window.BILLOW_I18N || { en: {}, zh: {} };
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* ---------- 语言：中文写在 HTML 里，英文从词典换上去 ---------- */
  var zhHtml = {}, zhAttr = [];
  $$("[data-i18n]").forEach(function (el) { zhHtml[el.getAttribute("data-i18n")] = el.innerHTML; });
  $$("[data-i18n-attr]").forEach(function (el) {
    var p = el.getAttribute("data-i18n-attr").split(":");
    zhAttr.push({ el: el, attr: p[0], key: p[1], zh: el.getAttribute(p[0]) });
  });
  var zhTitle = document.title;
  var zhDesc = $('meta[name="description"]').getAttribute("content");
  var lang = "zh";

  function t(key) {
    if (lang === "en" && I18N.en[key] != null) return I18N.en[key];
    if (I18N.zh[key] != null) return I18N.zh[key];
    return zhHtml[key] || "";
  }
  function setLang(next, remember) {
    lang = next === "en" ? "en" : "zh";
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
    $$("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      el.innerHTML = lang === "en" && I18N.en[k] != null ? I18N.en[k] : zhHtml[k];
    });
    zhAttr.forEach(function (a) { a.el.setAttribute(a.attr, lang === "en" && I18N.en[a.key] ? I18N.en[a.key] : a.zh); });
    document.title = lang === "en" ? I18N.en._title : zhTitle;
    $('meta[name="description"]').setAttribute("content", lang === "en" ? I18N.en._desc : zhDesc);
    $("#lang-toggle").textContent = lang === "en" ? "中文" : "English";
    applyConfig();
    if (remember) { try { localStorage.setItem("billow-lang", lang); } catch (e) {} }
  }
  function initialLang() {
    var q = /[?&]lang=(en|zh)/.exec(location.search);
    if (q) return q[1];
    try { var s = localStorage.getItem("billow-lang"); if (s) return s; } catch (e) {}
    return /^zh/i.test(navigator.language || "zh") ? "zh" : "en";
  }
  $("#lang-toggle").addEventListener("click", function () { setLang(lang === "en" ? "zh" : "en", true); });

  /* ---------- 按 site.config.js 接上下载、联系方式、演示视频 ---------- */
  function applyConfig() {
    var dl = CFG.downloads || {}, any = false;
    $$("[data-dl]").forEach(function (a) {
      var url = dl[a.getAttribute("data-dl")];
      if (url) { a.href = url; any = true; } else { a.href = "#join"; }
    });
    $("#dl-note").innerHTML = any ? t("dl.ready") : t("dl.pending");

    var w = CFG.wechat || {};
    if (w.qr) { $("#wechat-qr").src = w.qr; $("#wechat-qr").hidden = false; }
    if (w.id) { $("#wechat-id").textContent = w.id; $("#wechat-row").hidden = false; }
    if (CFG.email) {
      $("#email-link").textContent = CFG.email; $("#email-link").href = "mailto:" + CFG.email;
      $("#email-row").hidden = false;
    }
    $("#contact").hidden = !(w.qr || w.id || CFG.email);
  }
  $("#wechat-copy").addEventListener("click", function () {
    var btn = this, id = (CFG.wechat || {}).id || "";
    if (navigator.clipboard) navigator.clipboard.writeText(id).then(function () {
      btn.textContent = t("contact.copied");
      setTimeout(function () { btn.textContent = t("contact.copy"); }, 1600);
    });
  });
  (function video() {
    var src = CFG.demoVideo; if (!src) return;
    var slot = $("#demo-slot"), el;
    if (/\.(mp4|webm|mov)(\?|$)/i.test(src)) {
      el = document.createElement("video"); el.controls = true; el.preload = "metadata"; el.playsInline = true;
      if (CFG.demoPoster) el.poster = CFG.demoPoster;
    } else {
      el = document.createElement("iframe"); el.allowFullscreen = true; el.loading = "lazy";
      el.allow = "fullscreen; picture-in-picture";
    }
    el.src = src; slot.appendChild(el); $("#demo").hidden = false;
  })();

  /* ---------- 内测申请 ---------- */
  var form = $("#join-form"), msg = $("#form-msg");
  function say(key, bad) { msg.textContent = t(key); msg.classList.toggle("bad", !!bad); }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = { email: form.email.value.trim(), role: form.role.value, note: form.note.value.trim(), lang: lang };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { say("msg.invalid", true); form.email.focus(); return; }
    if (CFG.formEndpoint) {
      say("msg.sending");
      fetch(CFG.formEndpoint, {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset(); say("msg.sent");
      }).catch(function () { say("msg.failed", true); });
    } else if (CFG.email) {
      var body = "Email: " + data.email + "\nRole: " + data.role + "\n\n" + data.note;
      location.href = "mailto:" + CFG.email + "?subject=" + encodeURIComponent("Billow beta request") + "&body=" + encodeURIComponent(body);
      say("msg.mail");
    } else {
      say("msg.unset", true);
    }
  });

  $("#year").textContent = new Date().getFullYear();
  setLang(initialLang(), false);

  /* ---------- 麦田：竖直的笔画，一道波从左往右走；鼠标划过是一阵风 ----------
     笔画一律竖直、对齐像素网格（品牌规范）。动感来自起伏的深度。 */
  var cv = $("#field"); if (!cv || !cv.getContext) return;
  var ctx = cv.getContext("2d");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 0, H = 0, dpr = 1, bars = [], grad = null, raf = 0, visible = true;
  var gustX = -1, gustV = 0, gust = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = cv.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var bw = W < 640 ? 5 : 7, gap = W < 640 ? 6 : 9, step = bw + gap;
    var n = Math.ceil(W / step) + 1, off = Math.round((W - (n * step - gap)) / 2);
    bars = []; gust = [];
    for (var i = 0; i < n; i++) {
      // 每株高矮略有不同，但用固定的伪随机，重排时不跳
      var s = Math.sin(i * 127.1) * 43758.5453; s = s - Math.floor(s);
      bars.push({ x: off + i * step, w: bw, j: .82 + s * .18 });
      gust.push(0);
    }
    grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#5FE8D1"); grad.addColorStop(.45, "#35B9A8"); grad.addColorStop(1, "rgba(36,149,133,0)");
    draw(performance.now());
  }
  function draw(now) {
    var tsec = still ? 2.4 : now / 1000;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = grad;
    for (var i = 0; i < bars.length; i++) {
      var b = bars[i], u = b.x / W;
      // 一道主波从左向右行进，叠一道更细的涟漪
      var wave = .5 + .5 * Math.sin(u * 8.5 - tsec * .9);
      var ripple = .5 + .5 * Math.sin(u * 17 - tsec * 1.9 + 1.3);
      var h = (.3 + .5 * wave * wave + .1 * ripple) * b.j;
      // 一阵风：压低鼠标附近的麦子，再慢慢弹回
      if (gustX >= 0) {
        var d = (b.x - gustX) / 120, push = Math.exp(-d * d) * Math.min(1, gustV);
        if (push > gust[i]) gust[i] = push;
      }
      h *= 1 - .42 * gust[i];
      gust[i] *= .965;
      var px = Math.max(6, Math.round(h * H * .96));
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(b.x, H - px, b.w, px + b.w, b.w / 2); else ctx.rect(b.x, H - px, b.w, px);
      ctx.fill();
    }
    gustV *= .9;
  }
  function loop(now) { draw(now); raf = visible && !still ? requestAnimationFrame(loop) : 0; }
  function start() { if (!raf && !still && visible) raf = requestAnimationFrame(loop); }

  var lastX = null;
  cv.closest(".hero").addEventListener("pointermove", function (e) {
    var r = cv.getBoundingClientRect(), x = e.clientX - r.left;
    if (lastX != null) gustV = Math.min(1.4, gustV + Math.abs(x - lastX) / 60);
    lastX = x; gustX = x;
  });
  cv.closest(".hero").addEventListener("pointerleave", function () { lastX = null; });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); }).observe(cv);
  }
  document.addEventListener("visibilitychange", function () { visible = !document.hidden; if (visible) start(); });
  window.addEventListener("resize", resize);
  resize(); start();
})();
