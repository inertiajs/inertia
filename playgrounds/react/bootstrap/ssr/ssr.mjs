import * as jsxRuntime from "react/jsx-runtime";
import D from "axios";
import re from "deepmerge";
import * as C from "qs";
import h from "nprogress";
import { createContext, forwardRef, useCallback, createElement, useState, useMemo, useEffect } from "react";
import "lodash.isequal";
import { createServer } from "http";
import * as s from "process";
import ReactDOMServer from "react-dom/server";
const Fragment = jsxRuntime.Fragment;
const jsx = jsxRuntime.jsx;
const jsxs = jsxRuntime.jsxs;
function T(t, e) {
  let r;
  return function(...i) {
    clearTimeout(r), r = setTimeout(() => t.apply(this, i), e);
  };
}
function m(t, e) {
  return document.dispatchEvent(new CustomEvent(`inertia:${t}`, e));
}
var j = (t) => m("before", { cancelable: true, detail: { visit: t } }), q = (t) => m("error", { detail: { errors: t } }), $ = (t) => m("exception", { cancelable: true, detail: { exception: t } }), k = (t) => m("finish", { detail: { visit: t } }), W = (t) => m("invalid", { cancelable: true, detail: { response: t } }), P = (t) => m("navigate", { detail: { page: t } }), B = (t) => m("progress", { detail: { progress: t } }), K = (t) => m("start", { detail: { visit: t } }), X = (t) => m("success", { detail: { page: t } });
function L$1(t) {
  return t instanceof File || t instanceof Blob || t instanceof FileList && t.length > 0 || t instanceof FormData && Array.from(t.values()).some((e) => L$1(e)) || typeof t == "object" && t !== null && Object.values(t).some((e) => L$1(e));
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
function F$1(t, e, r, i = "brackets") {
  let s2 = /^https?:\/\//.test(e.toString()), n = s2 || e.toString().startsWith("/"), u = !n && !e.toString().startsWith("#") && !e.toString().startsWith("?"), f = e.toString().includes("?") || t === "get" && Object.keys(r).length, b = e.toString().includes("#"), l = new URL(e.toString(), "http://localhost");
  return t === "get" && Object.keys(r).length && (l.search = C.stringify(re(C.parse(l.search, { ignoreQueryPrefix: true }), r), { encodeValuesOnly: true, arrayFormat: i }), r = {}), [[s2 ? `${l.protocol}//${l.host}` : "", n ? l.pathname : "", u ? l.pathname.substring(1) : "", f ? l.search : "", b ? l.hash : ""].join(""), r];
}
function x(t) {
  return t = new URL(t.href), t.hash = "", t;
}
var Q = typeof window > "u", N$1 = class N {
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
    this.page.url += window.location.hash, this.setPage(e, { preserveState: true }).then(() => P(e));
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
      this.restoreScrollPositions(), P(e);
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
      r.preserveScroll && this.restoreScrollPositions(), P(e);
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
  visit(e, { method: r = "get", data: i = {}, replace: s2 = false, preserveScroll: n = false, preserveState: u = false, only: f = [], headers: b = {}, errorBag: l = "", forceFormData: c = false, onCancelToken: v = () => {
  }, onBefore: R = () => {
  }, onStart: d2 = () => {
  }, onProgress: p = () => {
  }, onFinish: V = () => {
  }, onCancel: y = () => {
  }, onSuccess: U = () => {
  }, onError: M2 = () => {
  }, queryStringArrayFormat: I = "brackets" } = {}) {
    let w2 = typeof e == "string" ? g$1(e) : e;
    if ((L$1(i) || c) && !(i instanceof FormData) && (i = O$1(i)), !(i instanceof FormData)) {
      let [o, a] = F$1(r, w2, i, I);
      w2 = g$1(o), i = a;
    }
    let S = { url: w2, method: r, data: i, replace: s2, preserveScroll: n, preserveState: u, only: f, headers: b, errorBag: l, forceFormData: c, queryStringArrayFormat: I, cancelled: false, completed: false, interrupted: false };
    if (R(S) === false || !j(S))
      return;
    this.activeVisit && this.cancelVisit(this.activeVisit, { interrupted: true }), this.saveScrollPositions();
    let H2 = this.createVisitId();
    this.activeVisit = { ...S, onCancelToken: v, onBefore: R, onStart: d2, onProgress: p, onFinish: V, onCancel: y, onSuccess: U, onError: M2, queryStringArrayFormat: I, cancelToken: D.CancelToken.source() }, v({ cancel: () => {
      this.activeVisit && this.cancelVisit(this.activeVisit, { cancelled: true });
    } }), K(S), d2(S), D({ method: r, url: x(w2).href, data: r === "get" ? {} : i, params: r === "get" ? i : {}, cancelToken: this.activeVisit.cancelToken.token, headers: { ...b, Accept: "text/html, application/xhtml+xml", "X-Requested-With": "XMLHttpRequest", "X-Inertia": true, ...f.length ? { "X-Inertia-Partial-Component": this.page.component, "X-Inertia-Partial-Data": f.join(",") } : {}, ...l && l.length ? { "X-Inertia-Error-Bag": l } : {}, ...this.page.version ? { "X-Inertia-Version": this.page.version } : {} }, onUploadProgress: (o) => {
      i instanceof FormData && (o.percentage = Math.round(o.loaded / o.total * 100), B(o), p(o));
    } }).then((o) => {
      var _a;
      if (!this.isInertiaResponse(o))
        return Promise.reject({ response: o });
      let a = o.data;
      f.length && a.component === this.page.component && (a.props = { ...this.page.props, ...a.props }), n = this.resolvePreserveOption(n, a), u = this.resolvePreserveOption(u, a), u && ((_a = window.history.state) == null ? void 0 : _a.rememberedState) && a.component === this.page.component && (a.rememberedState = window.history.state.rememberedState);
      let E = w2, G = g$1(a.url);
      return E.hash && !G.hash && x(E).href === G.href && (G.hash = E.hash, a.url = G.href), this.setPage(a, { visitId: H2, replace: s2, preserveScroll: n, preserveState: u });
    }).then(() => {
      let o = this.page.props.errors || {};
      if (Object.keys(o).length > 0) {
        let a = l ? o[l] ? o[l] : {} : o;
        return q(a), M2(a);
      }
      return X(this.page), U(this.page);
    }).catch((o) => {
      if (this.isInertiaResponse(o.response))
        return this.setPage(o.response.data, { visitId: H2 });
      if (this.isLocationVisitResponse(o.response)) {
        let a = g$1(o.response.headers["x-inertia-location"]), E = w2;
        E.hash && !a.hash && x(E).href === a.href && (a.hash = E.hash), this.locationVisit(a, n === true);
      } else if (o.response)
        W(o.response) && _.show(o.response.data);
      else
        return Promise.reject(o);
    }).then(() => {
      this.activeVisit && this.finishVisit(this.activeVisit);
    }).catch((o) => {
      if (!D.isCancel(o)) {
        let a = $(o);
        if (this.activeVisit && this.finishVisit(this.activeVisit), a)
          return Promise.reject(o);
      }
    });
  }
  setPage(e, { visitId: r = this.createVisitId(), replace: i = false, preserveScroll: s2 = false, preserveState: n = false } = {}) {
    return Promise.resolve(this.resolveComponent(e.component)).then((u) => {
      r === this.visitId && (e.scrollRegions = e.scrollRegions || [], e.rememberedState = e.rememberedState || {}, i = i || g$1(e.url).href === window.location.href, i ? this.replaceState(e) : this.pushState(e), this.swapComponent({ component: u, page: e, preserveState: n }).then(() => {
        s2 || this.resetScrollPositions(), i || P(e);
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
          this.restoreScrollPositions(), P(r);
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
var ie$1 = { buildDOMElement(t) {
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
  function f(c, v = []) {
    c !== null && Object.keys(i).indexOf(c) > -1 && (i[c] = v), l();
  }
  function b() {
    let c = e(""), v = { ...c ? { title: `<title inertia="">${c}</title>` } : {} }, R = Object.values(i).reduce((d2, p) => d2.concat(p), []).reduce((d2, p) => {
      if (p.indexOf("<") === -1)
        return d2;
      if (p.indexOf("<title ") === 0) {
        let y = p.match(/(<title [^>]+>)(.*?)(<\/title>)/);
        return d2.title = y ? `${y[1]}${e(y[2])}${y[3]}` : p, d2;
      }
      let V = p.match(/ inertia="[^"]+"/);
      return V ? d2[V[0]] = p : d2[Object.keys(d2).length] = p, d2;
    }, v);
    return Object.values(R);
  }
  function l() {
    t ? r(b()) : ie$1.update(b());
  }
  return l(), { forceUpdate: l, createProvider: function() {
    let c = n();
    return { update: (v) => f(c, v), disconnect: () => u(c) };
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
var Je = new N$1();
var M = createContext();
M.displayName = "InertiaHeadContext";
var H = M;
var N2 = createContext();
N2.displayName = "InertiaPageContext";
var L = N2;
function O({ children: d2, initialPage: u, initialComponent: c, resolveComponent: i, titleCallback: p, onHeadUpdate: m2 }) {
  let [x2, l] = useState({ component: c || null, page: u, key: null }), y = useMemo(() => Y(typeof window > "u", p || ((a) => a), m2 || (() => {
  })), []);
  if (useEffect(() => {
    Je.init({ initialPage: u, resolveComponent: i, swapComponent: async ({ component: a, page: e, preserveState: s2 }) => {
      l((o) => ({ component: a, page: e, key: s2 ? o.key : Date.now() }));
    } }), Je.on("navigate", () => y.forceUpdate());
  }, []), !x2.component)
    return createElement(H.Provider, { value: y }, createElement(L.Provider, { value: x2.page }, null));
  let b = d2 || (({ Component: a, props: e, key: s2 }) => {
    let o = createElement(a, { key: s2, ...e });
    return typeof a.layout == "function" ? a.layout(o) : Array.isArray(a.layout) ? a.layout.concat(o).reverse().reduce((f, C2) => createElement(C2, { children: f, ...e })) : o;
  });
  return createElement(H.Provider, { value: y }, createElement(L.Provider, { value: x2.page }, b({ Component: x2.component, key: x2.key, props: x2.page.props })));
}
O.displayName = "Inertia";
async function F({ id: d2 = "app", resolve: u, setup: c, title: i, progress: p = {}, page: m2, render: x2 }) {
  let l = typeof window > "u", y = l ? null : document.getElementById(d2), b = m2 || JSON.parse(y.dataset.page), a = (o) => Promise.resolve(u(o)).then((f) => f.default || f), e = [], s2 = await a(b.component).then((o) => c({ el: y, App: O, props: { initialPage: b, initialComponent: o, resolveComponent: a, titleCallback: i, onHeadUpdate: l ? (f) => e = f : null } }));
  if (!l && p && ee(p), l) {
    let o = await x2(createElement("div", { id: d2, "data-page": JSON.stringify(b) }, s2));
    return { head: e, body: o };
  }
}
var w = () => {
}, ie = forwardRef(function({ children: u, as: c = "a", data: i = {}, href: p, method: m2 = "get", preserveScroll: x2 = false, preserveState: l = null, replace: y = false, only: b = [], headers: a = {}, queryStringArrayFormat: e = "brackets", onClick: s2 = w, onCancelToken: o = w, onBefore: f = w, onStart: C2 = w, onProgress: E = w, onFinish: $2 = w, onCancel: v = w, onSuccess: A2 = w, onError: k2 = w, ...I }, S) {
  let t = useCallback((h2) => {
    s2(h2), te(h2) && (h2.preventDefault(), Je.visit(p, { data: i, method: m2, preserveScroll: x2, preserveState: l ?? m2 !== "get", replace: y, only: b, headers: a, onCancelToken: o, onBefore: f, onStart: C2, onProgress: E, onFinish: $2, onCancel: v, onSuccess: A2, onError: k2 }));
  }, [i, p, m2, x2, l, y, b, a, s2, o, f, C2, E, $2, v, A2, k2]);
  c = c.toLowerCase(), m2 = m2.toLowerCase();
  let [n, r] = F$1(m2, p || "", i, e);
  return p = n, i = r, c === "a" && m2 !== "get" && console.warn(`Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.

Please specify a more appropriate element using the "as" attribute. For example:

<Link href="${p}" method="${m2}" as="button">...</Link>`), createElement(c, { ...I, ...c === "a" ? { href: p } : {}, ref: S, onClick: t }, u);
});
function Layout({ children }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("nav", { className: "space-x-6 bg-slate-800 p-6 text-white", children: [
      /* @__PURE__ */ jsx(ie, { href: "/", children: "Home" }),
      /* @__PURE__ */ jsx(ie, { href: "/users", children: "Users" })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "p-6", children })
  ] });
}
function Home() {
  return /* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsx("h1", { className: "text-3xl", children: "Home" }) });
}
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Home
}, Symbol.toStringTag, { value: "Module" }));
function Users({ users }) {
  return /* @__PURE__ */ jsxs(Layout, { children: [
    /* @__PURE__ */ jsx("h1", { className: "text-3xl", children: "Users" }),
    /* @__PURE__ */ jsxs("table", { children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2", children: "Id" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2", children: "Name" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2", children: "Email" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: users.map((user) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "border px-4 py-2", children: user.id }),
        /* @__PURE__ */ jsx("td", { className: "border px-4 py-2", children: user.name }),
        /* @__PURE__ */ jsx("td", { className: "border px-4 py-2", children: user.email })
      ] }, user.id)) })
    ] })
  ] });
}
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
  (page) => F({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      const pages = /* @__PURE__ */ Object.assign({ "./Pages/Home.jsx": __vite_glob_0_0, "./Pages/Users.jsx": __vite_glob_0_1 });
      return pages[`./Pages/${name}.jsx`];
    },
    setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
  })
);
