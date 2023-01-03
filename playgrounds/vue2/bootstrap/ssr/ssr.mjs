import D from "axios";
import re from "deepmerge";
import * as C from "qs";
import h from "nprogress";
import b from "lodash.clonedeep";
import k$1 from "lodash.isequal";
import T$1 from "vue";
import { createServer } from "http";
import * as s from "process";
import { createRenderer } from "vue-server-renderer";
function T(t, e) {
  let r;
  return function(...i) {
    clearTimeout(r), r = setTimeout(() => t.apply(this, i), e);
  };
}
function m$1(t, e) {
  return document.dispatchEvent(new CustomEvent(`inertia:${t}`, e));
}
var j$1 = (t) => m$1("before", { cancelable: true, detail: { visit: t } }), q$1 = (t) => m$1("error", { detail: { errors: t } }), $$1 = (t) => m$1("exception", { cancelable: true, detail: { exception: t } }), k = (t) => m$1("finish", { detail: { visit: t } }), W = (t) => m$1("invalid", { cancelable: true, detail: { response: t } }), P$1 = (t) => m$1("navigate", { detail: { page: t } }), B = (t) => m$1("progress", { detail: { progress: t } }), K = (t) => m$1("start", { detail: { visit: t } }), X = (t) => m$1("success", { detail: { page: t } });
function L(t) {
  return t instanceof File || t instanceof Blob || t instanceof FileList && t.length > 0 || t instanceof FormData && Array.from(t.values()).some((e) => L(e)) || typeof t == "object" && t !== null && Object.values(t).some((e) => L(e));
}
function O$1(t, e = new FormData(), r = null) {
  t = t || {};
  for (let i in t)
    Object.prototype.hasOwnProperty.call(t, i) && z(e, J(r, i), t[i]);
  return e;
}
function J(t, e) {
  return t ? t + "[" + e + "]" : e;
}
function z(t, e, r) {
  if (Array.isArray(r))
    return Array.from(r.keys()).forEach((i) => z(t, J(e, i.toString()), r[i]));
  if (r instanceof Date)
    return t.append(e, r.toISOString());
  if (r instanceof File)
    return t.append(e, r, r.name);
  if (r instanceof Blob)
    return t.append(e, r);
  if (typeof r == "boolean")
    return t.append(e, r ? "1" : "0");
  if (typeof r == "string")
    return t.append(e, r);
  if (typeof r == "number")
    return t.append(e, `${r}`);
  if (r == null)
    return t.append(e, "");
  O$1(r, t, e);
}
var _ = { modal: null, listener: null, show(t) {
  typeof t == "object" && (t = `All Inertia requests must receive a valid Inertia response, however a plain JSON response was received.<hr>${JSON.stringify(t)}`);
  let e = document.createElement("html");
  e.innerHTML = t, e.querySelectorAll("a").forEach((i) => i.setAttribute("target", "_top")), this.modal = document.createElement("div"), this.modal.style.position = "fixed", this.modal.style.width = "100vw", this.modal.style.height = "100vh", this.modal.style.padding = "50px", this.modal.style.boxSizing = "border-box", this.modal.style.backgroundColor = "rgba(0, 0, 0, .6)", this.modal.style.zIndex = 2e5, this.modal.addEventListener("click", () => this.hide());
  let r = document.createElement("iframe");
  if (r.style.backgroundColor = "white", r.style.borderRadius = "5px", r.style.width = "100%", r.style.height = "100%", this.modal.appendChild(r), document.body.prepend(this.modal), document.body.style.overflow = "hidden", !r.contentWindow)
    throw new Error("iframe not yet ready.");
  r.contentWindow.document.open(), r.contentWindow.document.write(e.outerHTML), r.contentWindow.document.close(), this.listener = this.hideOnEscape.bind(this), document.addEventListener("keydown", this.listener);
}, hide() {
  this.modal.outerHTML = "", this.modal = null, document.body.style.overflow = "visible", document.removeEventListener("keydown", this.listener);
}, hideOnEscape(t) {
  t.keyCode === 27 && this.hide();
} };
var A = ((n) => (n.GET = "get", n.POST = "post", n.PUT = "put", n.PATCH = "patch", n.DELETE = "delete", n))(A || {});
function g$1(t) {
  return new URL(t.toString(), window.location.toString());
}
function F(t, e, r, i = "brackets") {
  let s2 = /^https?:\/\//.test(e.toString()), n = s2 || e.toString().startsWith("/"), u = !n && !e.toString().startsWith("#") && !e.toString().startsWith("?"), f = e.toString().includes("?") || t === "get" && Object.keys(r).length, b2 = e.toString().includes("#"), l = new URL(e.toString(), "http://localhost");
  return t === "get" && Object.keys(r).length && (l.search = C.stringify(re(C.parse(l.search, { ignoreQueryPrefix: true }), r), { encodeValuesOnly: true, arrayFormat: i }), r = {}), [[s2 ? `${l.protocol}//${l.host}` : "", n ? l.pathname : "", u ? l.pathname.substring(1) : "", f ? l.search : "", b2 ? l.hash : ""].join(""), r];
}
function x(t) {
  return t = new URL(t.href), t.hash = "", t;
}
var Q = typeof window > "u", N = class {
  constructor() {
    this.visitId = null;
  }
  init({ initialPage: e, resolveComponent: r, swapComponent: i }) {
    this.page = e, this.resolveComponent = r, this.swapComponent = i, this.setNavigationType(), this.clearRememberedStateOnReload(), this.isBackForwardVisit() ? this.handleBackForwardVisit(this.page) : this.isLocationVisit() ? this.handleLocationVisit(this.page) : this.handleInitialPageVisit(this.page), this.setupEventListeners();
  }
  setNavigationType() {
    this.navigationType = window.performance && window.performance.getEntriesByType("navigation").length > 0 ? window.performance.getEntriesByType("navigation")[0].type : "navigate";
  }
  clearRememberedStateOnReload() {
    var _a;
    this.navigationType === "reload" && ((_a = window.history.state) == null ? void 0 : _a.rememberedState) && delete window.history.state.rememberedState;
  }
  handleInitialPageVisit(e) {
    this.page.url += window.location.hash, this.setPage(e, { preserveState: true }).then(() => P$1(e));
  }
  setupEventListeners() {
    window.addEventListener("popstate", this.handlePopstateEvent.bind(this)), document.addEventListener("scroll", T(this.handleScrollEvent.bind(this), 100), true);
  }
  scrollRegions() {
    return document.querySelectorAll("[scroll-region]");
  }
  handleScrollEvent(e) {
    typeof e.target.hasAttribute == "function" && e.target.hasAttribute("scroll-region") && this.saveScrollPositions();
  }
  saveScrollPositions() {
    this.replaceState({ ...this.page, scrollRegions: Array.from(this.scrollRegions()).map((e) => ({ top: e.scrollTop, left: e.scrollLeft })) });
  }
  resetScrollPositions() {
    var _a;
    window.scrollTo(0, 0), this.scrollRegions().forEach((e) => {
      typeof e.scrollTo == "function" ? e.scrollTo(0, 0) : (e.scrollTop = 0, e.scrollLeft = 0);
    }), this.saveScrollPositions(), window.location.hash && ((_a = document.getElementById(window.location.hash.slice(1))) == null ? void 0 : _a.scrollIntoView());
  }
  restoreScrollPositions() {
    this.page.scrollRegions && this.scrollRegions().forEach((e, r) => {
      let i = this.page.scrollRegions[r];
      if (i)
        typeof e.scrollTo == "function" ? e.scrollTo(i.left, i.top) : (e.scrollTop = i.top, e.scrollLeft = i.left);
      else
        return;
    });
  }
  isBackForwardVisit() {
    return window.history.state && this.navigationType === "back_forward";
  }
  handleBackForwardVisit(e) {
    window.history.state.version = e.version, this.setPage(window.history.state, { preserveScroll: true, preserveState: true }).then(() => {
      this.restoreScrollPositions(), P$1(e);
    });
  }
  locationVisit(e, r) {
    try {
      let i = { preserveScroll: r };
      window.sessionStorage.setItem("inertiaLocationVisit", JSON.stringify(i)), window.location.href = e.href, x(window.location).href === x(e).href && window.location.reload();
    } catch {
      return false;
    }
  }
  isLocationVisit() {
    try {
      return window.sessionStorage.getItem("inertiaLocationVisit") !== null;
    } catch {
      return false;
    }
  }
  handleLocationVisit(e) {
    var _a, _b;
    let r = JSON.parse(window.sessionStorage.getItem("inertiaLocationVisit") || "");
    window.sessionStorage.removeItem("inertiaLocationVisit"), e.url += window.location.hash, e.rememberedState = ((_a = window.history.state) == null ? void 0 : _a.rememberedState) ?? {}, e.scrollRegions = ((_b = window.history.state) == null ? void 0 : _b.scrollRegions) ?? [], this.setPage(e, { preserveScroll: r.preserveScroll, preserveState: true }).then(() => {
      r.preserveScroll && this.restoreScrollPositions(), P$1(e);
    });
  }
  isLocationVisitResponse(e) {
    return !!(e && e.status === 409 && e.headers["x-inertia-location"]);
  }
  isInertiaResponse(e) {
    return !!(e == null ? void 0 : e.headers["x-inertia"]);
  }
  createVisitId() {
    return this.visitId = {}, this.visitId;
  }
  cancelVisit(e, { cancelled: r = false, interrupted: i = false }) {
    e && !e.completed && !e.cancelled && !e.interrupted && (e.cancelToken.cancel(), e.onCancel(), e.completed = false, e.cancelled = r, e.interrupted = i, k(e), e.onFinish(e));
  }
  finishVisit(e) {
    !e.cancelled && !e.interrupted && (e.completed = true, e.cancelled = false, e.interrupted = false, k(e), e.onFinish(e));
  }
  resolvePreserveOption(e, r) {
    return typeof e == "function" ? e(r) : e === "errors" ? Object.keys(r.props.errors || {}).length > 0 : e;
  }
  visit(e, { method: r = "get", data: i = {}, replace: s2 = false, preserveScroll: n = false, preserveState: u = false, only: f = [], headers: b2 = {}, errorBag: l = "", forceFormData: c = false, onCancelToken: v2 = () => {
  }, onBefore: R = () => {
  }, onStart: d2 = () => {
  }, onProgress: p = () => {
  }, onFinish: V = () => {
  }, onCancel: y2 = () => {
  }, onSuccess: U = () => {
  }, onError: M = () => {
  }, queryStringArrayFormat: I = "brackets" } = {}) {
    let w = typeof e == "string" ? g$1(e) : e;
    if ((L(i) || c) && !(i instanceof FormData) && (i = O$1(i)), !(i instanceof FormData)) {
      let [o, a] = F(r, w, i, I);
      w = g$1(o), i = a;
    }
    let S = { url: w, method: r, data: i, replace: s2, preserveScroll: n, preserveState: u, only: f, headers: b2, errorBag: l, forceFormData: c, queryStringArrayFormat: I, cancelled: false, completed: false, interrupted: false };
    if (R(S) === false || !j$1(S))
      return;
    this.activeVisit && this.cancelVisit(this.activeVisit, { interrupted: true }), this.saveScrollPositions();
    let H = this.createVisitId();
    this.activeVisit = { ...S, onCancelToken: v2, onBefore: R, onStart: d2, onProgress: p, onFinish: V, onCancel: y2, onSuccess: U, onError: M, queryStringArrayFormat: I, cancelToken: D.CancelToken.source() }, v2({ cancel: () => {
      this.activeVisit && this.cancelVisit(this.activeVisit, { cancelled: true });
    } }), K(S), d2(S), D({ method: r, url: x(w).href, data: r === "get" ? {} : i, params: r === "get" ? i : {}, cancelToken: this.activeVisit.cancelToken.token, headers: { ...b2, Accept: "text/html, application/xhtml+xml", "X-Requested-With": "XMLHttpRequest", "X-Inertia": true, ...f.length ? { "X-Inertia-Partial-Component": this.page.component, "X-Inertia-Partial-Data": f.join(",") } : {}, ...l && l.length ? { "X-Inertia-Error-Bag": l } : {}, ...this.page.version ? { "X-Inertia-Version": this.page.version } : {} }, onUploadProgress: (o) => {
      i instanceof FormData && (o.percentage = Math.round(o.loaded / o.total * 100), B(o), p(o));
    } }).then((o) => {
      var _a;
      if (!this.isInertiaResponse(o))
        return Promise.reject({ response: o });
      let a = o.data;
      f.length && a.component === this.page.component && (a.props = { ...this.page.props, ...a.props }), n = this.resolvePreserveOption(n, a), u = this.resolvePreserveOption(u, a), u && ((_a = window.history.state) == null ? void 0 : _a.rememberedState) && a.component === this.page.component && (a.rememberedState = window.history.state.rememberedState);
      let E = w, G = g$1(a.url);
      return E.hash && !G.hash && x(E).href === G.href && (G.hash = E.hash, a.url = G.href), this.setPage(a, { visitId: H, replace: s2, preserveScroll: n, preserveState: u });
    }).then(() => {
      let o = this.page.props.errors || {};
      if (Object.keys(o).length > 0) {
        let a = l ? o[l] ? o[l] : {} : o;
        return q$1(a), M(a);
      }
      return X(this.page), U(this.page);
    }).catch((o) => {
      if (this.isInertiaResponse(o.response))
        return this.setPage(o.response.data, { visitId: H });
      if (this.isLocationVisitResponse(o.response)) {
        let a = g$1(o.response.headers["x-inertia-location"]), E = w;
        E.hash && !a.hash && x(E).href === a.href && (a.hash = E.hash), this.locationVisit(a, n === true);
      } else if (o.response)
        W(o.response) && _.show(o.response.data);
      else
        return Promise.reject(o);
    }).then(() => {
      this.activeVisit && this.finishVisit(this.activeVisit);
    }).catch((o) => {
      if (!D.isCancel(o)) {
        let a = $$1(o);
        if (this.activeVisit && this.finishVisit(this.activeVisit), a)
          return Promise.reject(o);
      }
    });
  }
  setPage(e, { visitId: r = this.createVisitId(), replace: i = false, preserveScroll: s2 = false, preserveState: n = false } = {}) {
    return Promise.resolve(this.resolveComponent(e.component)).then((u) => {
      r === this.visitId && (e.scrollRegions = e.scrollRegions || [], e.rememberedState = e.rememberedState || {}, i = i || g$1(e.url).href === window.location.href, i ? this.replaceState(e) : this.pushState(e), this.swapComponent({ component: u, page: e, preserveState: n }).then(() => {
        s2 || this.resetScrollPositions(), i || P$1(e);
      }));
    });
  }
  pushState(e) {
    this.page = e, window.history.pushState(e, "", e.url);
  }
  replaceState(e) {
    this.page = e, window.history.replaceState(e, "", e.url);
  }
  handlePopstateEvent(e) {
    if (e.state !== null) {
      let r = e.state, i = this.createVisitId();
      Promise.resolve(this.resolveComponent(r.component)).then((s2) => {
        i === this.visitId && (this.page = r, this.swapComponent({ component: s2, page: r, preserveState: false }).then(() => {
          this.restoreScrollPositions(), P$1(r);
        }));
      });
    } else {
      let r = g$1(this.page.url);
      r.hash = window.location.hash, this.replaceState({ ...this.page, url: r.href }), this.resetScrollPositions();
    }
  }
  get(e, r = {}, i = {}) {
    return this.visit(e, { ...i, method: "get", data: r });
  }
  reload(e = {}) {
    return this.visit(window.location.href, { ...e, preserveScroll: true, preserveState: true });
  }
  replace(e, r = {}) {
    return console.warn(`Inertia.replace() has been deprecated and will be removed in a future release. Please use Inertia.${r.method ?? "get"}() instead.`), this.visit(e, { preserveState: true, ...r, replace: true });
  }
  post(e, r = {}, i = {}) {
    return this.visit(e, { preserveState: true, ...i, method: "post", data: r });
  }
  put(e, r = {}, i = {}) {
    return this.visit(e, { preserveState: true, ...i, method: "put", data: r });
  }
  patch(e, r = {}, i = {}) {
    return this.visit(e, { preserveState: true, ...i, method: "patch", data: r });
  }
  delete(e, r = {}) {
    return this.visit(e, { preserveState: true, ...r, method: "delete" });
  }
  remember(e, r = "default") {
    var _a;
    Q || this.replaceState({ ...this.page, rememberedState: { ...(_a = this.page) == null ? void 0 : _a.rememberedState, [r]: e } });
  }
  restore(e = "default") {
    var _a, _b;
    if (!Q)
      return (_b = (_a = window.history.state) == null ? void 0 : _a.rememberedState) == null ? void 0 : _b[e];
  }
  on(e, r) {
    let i = (s2) => {
      let n = r(s2);
      s2.cancelable && !s2.defaultPrevented && n === false && s2.preventDefault();
    };
    return document.addEventListener(`inertia:${e}`, i), () => document.removeEventListener(`inertia:${e}`, i);
  }
};
var ie = { buildDOMElement(t) {
  let e = document.createElement("template");
  e.innerHTML = t;
  let r = e.content.firstChild;
  if (!t.startsWith("<script "))
    return r;
  let i = document.createElement("script");
  return i.innerHTML = r.innerHTML, r.getAttributeNames().forEach((s2) => {
    i.setAttribute(s2, r.getAttribute(s2) || "");
  }), i;
}, isInertiaManagedElement(t) {
  return t.nodeType === Node.ELEMENT_NODE && t.getAttribute("inertia") !== null;
}, findMatchingElementIndex(t, e) {
  let r = t.getAttribute("inertia");
  return r !== null ? e.findIndex((i) => i.getAttribute("inertia") === r) : -1;
}, update: T(function(t) {
  let e = t.map((i) => this.buildDOMElement(i));
  Array.from(document.head.childNodes).filter((i) => this.isInertiaManagedElement(i)).forEach((i) => {
    var _a, _b;
    let s2 = this.findMatchingElementIndex(i, e);
    if (s2 === -1) {
      (_a = i == null ? void 0 : i.parentNode) == null ? void 0 : _a.removeChild(i);
      return;
    }
    let n = e.splice(s2, 1)[0];
    n && !i.isEqualNode(n) && ((_b = i == null ? void 0 : i.parentNode) == null ? void 0 : _b.replaceChild(n, i));
  }), e.forEach((i) => document.head.appendChild(i));
}, 1) };
function Y(t, e, r) {
  let i = {}, s2 = 0;
  function n() {
    let c = s2 += 1;
    return i[c] = [], c.toString();
  }
  function u(c) {
    c === null || Object.keys(i).indexOf(c) === -1 || (delete i[c], l());
  }
  function f(c, v2 = []) {
    c !== null && Object.keys(i).indexOf(c) > -1 && (i[c] = v2), l();
  }
  function b2() {
    let c = e(""), v2 = { ...c ? { title: `<title inertia="">${c}</title>` } : {} }, R = Object.values(i).reduce((d2, p) => d2.concat(p), []).reduce((d2, p) => {
      if (p.indexOf("<") === -1)
        return d2;
      if (p.indexOf("<title ") === 0) {
        let y2 = p.match(/(<title [^>]+>)(.*?)(<\/title>)/);
        return d2.title = y2 ? `${y2[1]}${e(y2[2])}${y2[3]}` : p, d2;
      }
      let V = p.match(/ inertia="[^"]+"/);
      return V ? d2[V[0]] = p : d2[Object.keys(d2).length] = p, d2;
    }, v2);
    return Object.values(R);
  }
  function l() {
    t ? r(b2()) : ie.update(b2());
  }
  return l(), { forceUpdate: l, createProvider: function() {
    let c = n();
    return { update: (v2) => f(c, v2), disconnect: () => u(c) };
  } };
}
var Z = null;
function oe(t) {
  document.addEventListener("inertia:start", ne.bind(null, t)), document.addEventListener("inertia:progress", se), document.addEventListener("inertia:finish", ae);
}
function ne(t) {
  Z = setTimeout(() => h.start(), t);
}
function se(t) {
  var _a;
  h.isStarted() && ((_a = t.detail.progress) == null ? void 0 : _a.percentage) && h.set(Math.max(h.status, t.detail.progress.percentage / 100 * 0.9));
}
function ae(t) {
  if (clearTimeout(Z), h.isStarted())
    t.detail.visit.completed ? h.done() : t.detail.visit.interrupted ? h.set(0) : t.detail.visit.cancelled && (h.done(), h.remove());
  else
    return;
}
function le(t) {
  let e = document.createElement("style");
  e.type = "text/css", e.textContent = `
    #nprogress {
      pointer-events: none;
    }

    #nprogress .bar {
      background: ${t};

      position: fixed;
      z-index: 1031;
      top: 0;
      left: 0;

      width: 100%;
      height: 2px;
    }

    #nprogress .peg {
      display: block;
      position: absolute;
      right: 0px;
      width: 100px;
      height: 100%;
      box-shadow: 0 0 10px ${t}, 0 0 5px ${t};
      opacity: 1.0;

      -webkit-transform: rotate(3deg) translate(0px, -4px);
          -ms-transform: rotate(3deg) translate(0px, -4px);
              transform: rotate(3deg) translate(0px, -4px);
    }

    #nprogress .spinner {
      display: block;
      position: fixed;
      z-index: 1031;
      top: 15px;
      right: 15px;
    }

    #nprogress .spinner-icon {
      width: 18px;
      height: 18px;
      box-sizing: border-box;

      border: solid 2px transparent;
      border-top-color: ${t};
      border-left-color: ${t};
      border-radius: 50%;

      -webkit-animation: nprogress-spinner 400ms linear infinite;
              animation: nprogress-spinner 400ms linear infinite;
    }

    .nprogress-custom-parent {
      overflow: hidden;
      position: relative;
    }

    .nprogress-custom-parent #nprogress .spinner,
    .nprogress-custom-parent #nprogress .bar {
      position: absolute;
    }

    @-webkit-keyframes nprogress-spinner {
      0%   { -webkit-transform: rotate(0deg); }
      100% { -webkit-transform: rotate(360deg); }
    }
    @keyframes nprogress-spinner {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `, document.head.appendChild(e);
}
function ee({ delay: t = 250, color: e = "#29d", includeCSS: r = true, showSpinner: i = false } = {}) {
  oe(t), h.configure({ showSpinner: i }), r && le(e);
}
function te(t) {
  let e = t.currentTarget.tagName.toLowerCase() === "a";
  return !(t.target && (t == null ? void 0 : t.target).isContentEditable || t.defaultPrevented || e && t.which > 1 || e && t.altKey || e && t.ctrlKey || e && t.metaKey || e && t.shiftKey);
}
var Je = new N();
var O = { created() {
  if (!this.$options.remember || this.$isServer)
    return;
  Array.isArray(this.$options.remember) && (this.$options.remember = { data: this.$options.remember }), typeof this.$options.remember == "string" && (this.$options.remember = { data: [this.$options.remember] }), typeof this.$options.remember.data == "string" && (this.$options.remember = { data: [this.$options.remember.data] });
  let e = this.$options.remember.key instanceof Function ? this.$options.remember.key.call(this) : this.$options.remember.key, t = Je.restore(e), s2 = this.$options.remember.data.filter((n) => !(this[n] !== null && typeof this[n] == "object" && this[n].__rememberable === false)), l = (n) => this[n] !== null && typeof this[n] == "object" && typeof this[n].__remember == "function" && typeof this[n].__restore == "function";
  s2.forEach((n) => {
    this[n] !== void 0 && t !== void 0 && t[n] !== void 0 && (l(n) ? this[n].__restore(t[n]) : this[n] = t[n]), this.$watch(n, () => {
      Je.remember(s2.reduce((u, c) => ({ ...u, [c]: l(c) ? this[c].__remember() : this[c] }), {}), e);
    }, { immediate: true, deep: true });
  });
} };
function y(...e) {
  let t = typeof e[0] == "string" ? e[0] : null, s2 = (typeof e[0] == "string" ? e[1] : e[0]) || {}, l = t ? Je.restore(t) : null, n = b(s2), u = null, c = null, p = (r) => r, h2 = T$1.observable({ ...l ? l.data : s2, isDirty: false, errors: l ? l.errors : {}, hasErrors: false, processing: false, progress: null, wasSuccessful: false, recentlySuccessful: false, data() {
    return Object.keys(s2).reduce((r, i) => (r[i] = this[i], r), {});
  }, transform(r) {
    return p = r, this;
  }, defaults(r, i) {
    return typeof r > "u" ? n = this.data() : n = Object.assign({}, b(n), i ? { [r]: i } : r), this;
  }, reset(...r) {
    let i = b(n);
    return r.length === 0 ? Object.assign(this, i) : Object.assign(this, Object.keys(i).filter((o) => r.includes(o)).reduce((o, d2) => (o[d2] = i[d2], o), {})), this;
  }, setError(r, i) {
    return Object.assign(this.errors, i ? { [r]: i } : r), this.hasErrors = Object.keys(this.errors).length > 0, this;
  }, clearErrors(...r) {
    return this.errors = Object.keys(this.errors).reduce((i, o) => ({ ...i, ...r.length > 0 && !r.includes(o) ? { [o]: this.errors[o] } : {} }), {}), this.hasErrors = Object.keys(this.errors).length > 0, this;
  }, submit(r, i, o = {}) {
    let d2 = p(this.data()), f = { ...o, onCancelToken: (a) => {
      if (u = a, o.onCancelToken)
        return o.onCancelToken(a);
    }, onBefore: (a) => {
      if (this.wasSuccessful = false, this.recentlySuccessful = false, clearTimeout(c), o.onBefore)
        return o.onBefore(a);
    }, onStart: (a) => {
      if (this.processing = true, o.onStart)
        return o.onStart(a);
    }, onProgress: (a) => {
      if (this.progress = a, o.onProgress)
        return o.onProgress(a);
    }, onSuccess: async (a) => {
      this.processing = false, this.progress = null, this.clearErrors(), this.wasSuccessful = true, this.recentlySuccessful = true, c = setTimeout(() => this.recentlySuccessful = false, 2e3);
      let x2 = o.onSuccess ? await o.onSuccess(a) : null;
      return n = b(this.data()), this.isDirty = false, x2;
    }, onError: (a) => {
      if (this.processing = false, this.progress = null, this.clearErrors().setError(a), o.onError)
        return o.onError(a);
    }, onCancel: () => {
      if (this.processing = false, this.progress = null, o.onCancel)
        return o.onCancel();
    }, onFinish: (a) => {
      if (this.processing = false, this.progress = null, u = null, o.onFinish)
        return o.onFinish(a);
    } };
    r === "delete" ? Je.delete(i, { ...f, data: d2 }) : Je[r](i, d2, f);
  }, get(r, i) {
    this.submit("get", r, i);
  }, post(r, i) {
    this.submit("post", r, i);
  }, put(r, i) {
    this.submit("put", r, i);
  }, patch(r, i) {
    this.submit("patch", r, i);
  }, delete(r, i) {
    this.submit("delete", r, i);
  }, cancel() {
    u && u.cancel();
  }, __rememberable: t === null, __remember() {
    return { data: this.data(), errors: this.errors };
  }, __restore(r) {
    Object.assign(this, r.data), this.setError(r.errors);
  } });
  return new T$1({ created() {
    this.$watch(() => h2, (r) => {
      h2.isDirty = !k$1(h2.data(), n), t && Je.remember(r.__remember(), t);
    }, { immediate: true, deep: true });
  } }), h2;
}
var m = {}, $ = null, P = { name: "Inertia", props: { initialPage: { type: Object, required: true }, initialComponent: { type: [Object, Function, String], required: false }, resolveComponent: { type: Function, required: false }, titleCallback: { type: Function, required: false, default: (e) => e }, onHeadUpdate: { type: Function, required: false, default: () => () => {
} } }, data() {
  return { component: this.initialComponent || null, page: this.initialPage, key: null };
}, created() {
  m = this, $ = Y(this.$isServer, this.titleCallback, this.onHeadUpdate), this.$isServer || (Je.init({ initialPage: this.initialPage, resolveComponent: this.resolveComponent, swapComponent: async ({ component: e, page: t, preserveState: s2 }) => {
    this.component = e, this.page = t, this.key = s2 ? this.key : Date.now();
  } }), Je.on("navigate", () => $.forceUpdate()));
}, render(e) {
  if (this.component) {
    let t = e(this.component, { key: this.key, props: this.page.props, scopedSlots: this.$scopedSlots });
    return this.component.layout ? typeof this.component.layout == "function" ? this.component.layout(e, t) : Array.isArray(this.component.layout) ? this.component.layout.concat(t).reverse().reduce((s2, l) => e(l, { props: this.page.props }, [s2])) : e(this.component.layout, { props: this.page.props }, [t]) : t;
  }
} }, v = { install(e) {
  Je.form = y, e.mixin(O), e.mixin({ beforeCreate() {
    Object.defineProperty(this, "$headManager", { get: function() {
      return $;
    } }), Object.defineProperty(this, "$inertia", { get: function() {
      return Je;
    } }), Object.defineProperty(this, "$page", { get: function() {
      return m.page;
    } });
  } });
} };
async function j({ id: e = "app", resolve: t, setup: s2, title: l, progress: n = {}, page: u, render: c }) {
  let p = typeof window > "u", h2 = p ? null : document.getElementById(e), r = u || JSON.parse(h2.dataset.page), i = (f) => Promise.resolve(t(f)).then((a) => a.default || a), o = [], d2 = await i(r.component).then((f) => s2({ el: h2, App: P, props: { attrs: { id: e, "data-page": JSON.stringify(r) }, props: { initialPage: r, initialComponent: f, resolveComponent: i, titleCallback: l, onHeadUpdate: p ? (a) => o = a : null } }, plugin: v }));
  if (!p && n && ee(n), p)
    return c(d2).then((f) => ({ head: o, body: f }));
}
var q = { functional: true, props: { as: { type: String, default: "a" }, data: { type: Object, default: () => ({}) }, href: { type: String }, method: { type: String, default: "get" }, replace: { type: Boolean, default: false }, preserveScroll: { type: Boolean, default: false }, preserveState: { type: Boolean, default: null }, only: { type: Array, default: () => [] }, headers: { type: Object, default: () => ({}) }, queryStringArrayFormat: { type: String, default: "brackets" } }, render(e, { props: t, data: s2, children: l }) {
  s2.on = { click: () => ({}), cancelToken: () => ({}), start: () => ({}), progress: () => ({}), finish: () => ({}), cancel: () => ({}), success: () => ({}), error: () => ({}), ...s2.on || {} };
  let n = t.as.toLowerCase(), u = t.method.toLowerCase(), [c, p] = F(u, t.href || "", t.data, t.queryStringArrayFormat);
  return n === "a" && u !== "get" && console.warn(`Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.

Please specify a more appropriate element using the "as" attribute. For example:

<Link href="${c}" method="${u}" as="button">...</Link>`), e(t.as, { ...s2, attrs: { ...s2.attrs, ...n === "a" ? { href: c } : {} }, on: { ...s2.on, click: (h2) => {
    s2.on.click(h2), te(h2) && (h2.preventDefault(), Je.visit(c, { data: p, method: u, replace: t.replace, preserveScroll: t.preserveScroll, preserveState: t.preserveState ?? u !== "get", only: t.only, headers: t.headers, onCancelToken: s2.on.cancelToken, onBefore: s2.on.before, onStart: s2.on.start, onProgress: s2.on.progress, onFinish: s2.on.finish, onCancel: s2.on.cancel, onSuccess: s2.on.success, onError: s2.on.error }));
  } } }, l);
} };
function normalizeComponent(scriptExports, render4, staticRenderFns, functionalTemplate, injectStyles, scopeId, moduleIdentifier, shadowMode) {
  var options = typeof scriptExports === "function" ? scriptExports.options : scriptExports;
  if (render4) {
    options.render = render4;
    options.staticRenderFns = staticRenderFns;
    options._compiled = true;
  }
  if (functionalTemplate) {
    options.functional = true;
  }
  if (scopeId) {
    options._scopeId = "data-v-" + scopeId;
  }
  var hook;
  if (moduleIdentifier) {
    hook = function(context) {
      context = context || this.$vnode && this.$vnode.ssrContext || this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext;
      if (!context && typeof __VUE_SSR_CONTEXT__ !== "undefined") {
        context = __VUE_SSR_CONTEXT__;
      }
      if (injectStyles) {
        injectStyles.call(this, context);
      }
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    };
    options._ssrRegister = hook;
  } else if (injectStyles) {
    hook = shadowMode ? function() {
      injectStyles.call(
        this,
        (options.functional ? this.parent : this).$root.$options.shadowRoot
      );
    } : injectStyles;
  }
  if (hook) {
    if (options.functional) {
      options._injectStyles = hook;
      var originalRender = options.render;
      options.render = function renderWithStyleInjection(h2, context) {
        hook.call(context);
        return originalRender(h2, context);
      };
    } else {
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }
  return {
    exports: scriptExports,
    options
  };
}
const _sfc_main$2 = {
  components: { Link: q }
};
var _sfc_render$2 = function render() {
  var _vm = this, _c = _vm._self._c;
  return _c("div", [_vm._ssrNode('<nav class="space-x-6 bg-slate-800 p-6 text-white">', "</nav>", [_c("Link", { attrs: { "href": "/" } }, [_vm._v("Home")]), _c("Link", { attrs: { "href": "/users" } }, [_vm._v("Users")])], 1), _vm._ssrNode('<main class="p-6">', "</main>", [_vm._t("default")], 2)]);
};
var _sfc_staticRenderFns$2 = [];
var __component__$2 = /* @__PURE__ */ normalizeComponent(
  _sfc_main$2,
  _sfc_render$2,
  _sfc_staticRenderFns$2,
  false,
  null,
  null,
  null,
  null
);
const Layout = __component__$2.exports;
const _sfc_main$1 = {
  components: { Layout }
};
var _sfc_render$1 = function render2() {
  var _vm = this, _c = _vm._self._c;
  return _c("Layout", [_c("h1", { staticClass: "text-3xl" }, [_vm._v("Home")])]);
};
var _sfc_staticRenderFns$1 = [];
var __component__$1 = /* @__PURE__ */ normalizeComponent(
  _sfc_main$1,
  _sfc_render$1,
  _sfc_staticRenderFns$1,
  false,
  null,
  null,
  null,
  null
);
const Home = __component__$1.exports;
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Home
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main = {
  components: { Layout },
  props: {
    users: {
      type: Array,
      required: true
    }
  }
};
var _sfc_render = function render3() {
  var _vm = this, _c = _vm._self._c;
  return _c("Layout", [_c("h1", { staticClass: "text-3xl" }, [_vm._v("Users")]), _c("table", [_c("thead", [_c("tr", [_c("th", { staticClass: "px-4 py-2" }, [_vm._v("Id")]), _c("th", { staticClass: "px-4 py-2" }, [_vm._v("Name")]), _c("th", { staticClass: "px-4 py-2" }, [_vm._v("Email")])])]), _c("tbody", _vm._l(_vm.users, function(user) {
    return _c("tr", { key: user.id }, [_c("td", { staticClass: "border px-4 py-2" }, [_vm._v(_vm._s(user.id))]), _c("td", { staticClass: "border px-4 py-2" }, [_vm._v(_vm._s(user.name))]), _c("td", { staticClass: "border px-4 py-2" }, [_vm._v(_vm._s(user.email))])]);
  }), 0)])]);
};
var _sfc_staticRenderFns = [];
var __component__ = /* @__PURE__ */ normalizeComponent(
  _sfc_main,
  _sfc_render,
  _sfc_staticRenderFns,
  false,
  null,
  null,
  null,
  null
);
const Users = __component__.exports;
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Users
}, Symbol.toStringTag, { value: "Module" }));
var g = (t) => new Promise((o, n) => {
  let r = "";
  t.on("data", (e) => r += e), t.on("end", () => o(r)), t.on("error", (e) => n(e));
}), d = (t, o) => {
  let n = o || 13714, r = { "/health": async () => ({ status: "OK", timestamp: Date.now() }), "/shutdown": () => s.exit(), "/render": async (e) => t(JSON.parse(await g(e))), "/404": async () => ({ status: "NOT_FOUND", timestamp: Date.now() }) };
  createServer(async (e, a) => {
    let i = r[e.url] || r["/404"];
    try {
      a.writeHead(200, { "Content-Type": "application/json", Server: "Inertia.js SSR" }), a.write(JSON.stringify(await i(e)));
    } catch (p) {
      console.error(p);
    }
    a.end();
  }).listen(n, () => console.log("Inertia SSR server started.")), console.log(`Starting SSR server on port ${n}...`);
};
d(
  (page) => j({
    page,
    render: createRenderer().renderToString,
    resolve: (name) => {
      const pages = /* @__PURE__ */ Object.assign({ "./Pages/Home.vue": __vite_glob_0_0, "./Pages/Users.vue": __vite_glob_0_1 });
      return pages[`./Pages/${name}.vue`];
    },
    setup({ App, props, plugin }) {
      T$1.use(plugin);
      return new T$1({
        render: (h2) => h2(App, props)
      });
    }
  })
);
