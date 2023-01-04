import D from "axios";
import re from "deepmerge";
import * as C from "qs";
import h$1 from "nprogress";
import "lodash.isequal";
import { createServer } from "http";
import * as s from "process";
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function subscribe(store2, ...callbacks) {
  if (store2 == null) {
    return noop;
  }
  const unsub = store2.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
Promise.resolve();
const ATTR_REGEX = /[&"]/g;
const CONTENT_REGEX = /[&<]/g;
function escape(value, is_attr = false) {
  const str = String(value);
  const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX;
  pattern.lastIndex = 0;
  let escaped = "";
  let last = 0;
  while (pattern.test(str)) {
    const i = pattern.lastIndex - 1;
    const ch = str[i];
    escaped += str.substring(last, i) + (ch === "&" ? "&amp;" : ch === '"' ? "&quot;" : "&lt;");
    last = i + 1;
  }
  return escaped + str.substring(last);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
const missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules. Otherwise you may need to fix a <${name}>.`);
  }
  return component;
}
let on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = /* @__PURE__ */ new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: /* @__PURE__ */ new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css) => css.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  const assignment = boolean && value === true ? "" : `="${escape(value, true)}"`;
  return ` ${name}${assignment}`;
}
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
function L(t) {
  return t instanceof File || t instanceof Blob || t instanceof FileList && t.length > 0 || t instanceof FormData && Array.from(t.values()).some((e) => L(e)) || typeof t == "object" && t !== null && Object.values(t).some((e) => L(e));
}
function O(t, e = new FormData(), r = null) {
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
  O(r, t, e);
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
  let s2 = /^https?:\/\//.test(e.toString()), n = s2 || e.toString().startsWith("/"), u = !n && !e.toString().startsWith("#") && !e.toString().startsWith("?"), f = e.toString().includes("?") || t === "get" && Object.keys(r).length, b = e.toString().includes("#"), l = new URL(e.toString(), "http://localhost");
  return t === "get" && Object.keys(r).length && (l.search = C.stringify(re(C.parse(l.search, { ignoreQueryPrefix: true }), r), { encodeValuesOnly: true, arrayFormat: i }), r = {}), [[s2 ? `${l.protocol}//${l.host}` : "", n ? l.pathname : "", u ? l.pathname.substring(1) : "", f ? l.search : "", b ? l.hash : ""].join(""), r];
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
  }, onError: M = () => {
  }, queryStringArrayFormat: I = "brackets" } = {}) {
    let w = typeof e == "string" ? g$1(e) : e;
    if ((L(i) || c) && !(i instanceof FormData) && (i = O(i)), !(i instanceof FormData)) {
      let [o, a] = F(r, w, i, I);
      w = g$1(o), i = a;
    }
    let S = { url: w, method: r, data: i, replace: s2, preserveScroll: n, preserveState: u, only: f, headers: b, errorBag: l, forceFormData: c, queryStringArrayFormat: I, cancelled: false, completed: false, interrupted: false };
    if (R(S) === false || !j(S))
      return;
    this.activeVisit && this.cancelVisit(this.activeVisit, { interrupted: true }), this.saveScrollPositions();
    let H = this.createVisitId();
    this.activeVisit = { ...S, onCancelToken: v, onBefore: R, onStart: d2, onProgress: p, onFinish: V, onCancel: y, onSuccess: U, onError: M, queryStringArrayFormat: I, cancelToken: D.CancelToken.source() }, v({ cancel: () => {
      this.activeVisit && this.cancelVisit(this.activeVisit, { cancelled: true });
    } }), K(S), d2(S), D({ method: r, url: x(w).href, data: r === "get" ? {} : i, params: r === "get" ? i : {}, cancelToken: this.activeVisit.cancelToken.token, headers: { ...b, Accept: "text/html, application/xhtml+xml", "X-Requested-With": "XMLHttpRequest", "X-Inertia": true, ...f.length ? { "X-Inertia-Partial-Component": this.page.component, "X-Inertia-Partial-Data": f.join(",") } : {}, ...l && l.length ? { "X-Inertia-Error-Bag": l } : {}, ...this.page.version ? { "X-Inertia-Version": this.page.version } : {} }, onUploadProgress: (o) => {
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
        return q(a), M(a);
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
var Z = null;
function oe(t) {
  document.addEventListener("inertia:start", ne.bind(null, t)), document.addEventListener("inertia:progress", se), document.addEventListener("inertia:finish", ae);
}
function ne(t) {
  Z = setTimeout(() => h$1.start(), t);
}
function se(t) {
  var _a;
  h$1.isStarted() && ((_a = t.detail.progress) == null ? void 0 : _a.percentage) && h$1.set(Math.max(h$1.status, t.detail.progress.percentage / 100 * 0.9));
}
function ae(t) {
  if (clearTimeout(Z), h$1.isStarted())
    t.detail.visit.completed ? h$1.done() : t.detail.visit.interrupted ? h$1.set(0) : t.detail.visit.cancelled && (h$1.done(), h$1.remove());
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
  oe(t), h$1.configure({ showSpinner: i }), r && le(e);
}
var Je = new N();
const subscriber_queue = [];
function readable(value, start) {
  return {
    subscribe: writable(value, start).subscribe
  };
}
function writable(value, start = noop) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function derived(stores, fn, initial_value) {
  const single = !Array.isArray(stores);
  const stores_array = single ? [stores] : stores;
  const auto = fn.length < 2;
  return readable(initial_value, (set) => {
    let inited = false;
    const values = [];
    let pending = 0;
    let cleanup = noop;
    const sync = () => {
      if (pending) {
        return;
      }
      cleanup();
      const result = fn(single ? values[0] : values, set);
      if (auto) {
        set(result);
      } else {
        cleanup = is_function(result) ? result : noop;
      }
    };
    const unsubscribers = stores_array.map((store2, i) => subscribe(store2, (value) => {
      values[i] = value;
      pending &= ~(1 << i);
      if (inited) {
        sync();
      }
    }, () => {
      pending |= 1 << i;
    }));
    inited = true;
    sync();
    return function stop() {
      run_all(unsubscribers);
      cleanup();
    };
  });
}
const store = writable({
  component: null,
  layout: [],
  page: {},
  key: null
});
const h = (component, props, children) => {
  return {
    component,
    ...props ? { props } : {},
    ...children ? { children } : {}
  };
};
const Render = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $store, $$unsubscribe_store;
  $$unsubscribe_store = subscribe(store, (value) => $store = value);
  let { component } = $$props;
  let { props = {} } = $$props;
  let { children = [] } = $$props;
  if ($$props.component === void 0 && $$bindings.component && component !== void 0)
    $$bindings.component(component);
  if ($$props.props === void 0 && $$bindings.props && props !== void 0)
    $$bindings.props(props);
  if ($$props.children === void 0 && $$bindings.children && children !== void 0)
    $$bindings.children(children);
  $$unsubscribe_store();
  return `${$store.component ? `${validate_component(component || missing_component, "svelte:component").$$render($$result, Object.assign(props), {}, {
    default: () => {
      return `${each(children, (child, index) => {
        return `${validate_component(Render, "svelte:self").$$render($$result, Object.assign(child), {}, {})}`;
      })}`;
    }
  })}` : ``}`;
});
const App = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let child;
  let layout;
  let components;
  let $store, $$unsubscribe_store;
  $$unsubscribe_store = subscribe(store, (value) => $store = value);
  child = $store.component && h($store.component.default, $store.page.props);
  layout = $store.component && $store.component.layout;
  components = layout ? Array.isArray(layout) ? layout.concat(child).reverse().reduce((child2, layout2) => h(layout2, $store.page.props, [child2])) : h(layout, $store.page.props, [child]) : child;
  $$unsubscribe_store();
  return `${validate_component(Render, "Render").$$render($$result, Object.assign(components), {}, {})}`;
});
const SSR = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { id, initialPage } = $$props;
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.initialPage === void 0 && $$bindings.initialPage && initialPage !== void 0)
    $$bindings.initialPage(initialPage);
  return `<div data-server-rendered="${"true"}"${add_attribute("id", id, 0)}${add_attribute("data-page", JSON.stringify(initialPage), 0)}>${validate_component(App, "App").$$render($$result, {}, {}, {})}</div>`;
});
async function createInertiaApp({ id = "app", resolve, setup, progress = {}, page }) {
  const isServer = typeof window === "undefined";
  const el = isServer ? null : document.getElementById(id);
  const initialPage = page || JSON.parse(el.dataset.page);
  const resolveComponent = (name) => Promise.resolve(resolve(name));
  await resolveComponent(initialPage.component).then((initialComponent) => {
    store.set({
      component: initialComponent,
      page: initialPage
    });
  });
  if (!isServer) {
    Je.init({
      initialPage,
      resolveComponent,
      swapComponent: async ({ component, page: page2, preserveState }) => {
        store.update((current) => ({
          component,
          page: page2,
          key: preserveState ? current.key : Date.now()
        }));
      }
    });
    if (progress) {
      ee(progress);
    }
    return setup({
      el,
      App,
      props: {
        initialPage,
        resolveComponent
      }
    });
  }
  if (isServer) {
    const { html, head } = SSR.render({ id, initialPage });
    return {
      body: html,
      head: [head]
    };
  }
}
derived(store, ($store) => $store.page);
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<nav class="${"space-x-6 bg-slate-800 p-6 text-white"}"><a href="${"/"}">Home</a>
  <a href="${"/users"}">Users</a></nav>
<main class="${"p-6"}">${slots.default ? slots.default({}) : ``}</main>`;
});
const Home = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Layout, "Layout").$$render($$result, {}, {}, {
    default: () => {
      return `<h1 class="${"text-3xl"}">Home</h1>`;
    }
  })}`;
});
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Home
}, Symbol.toStringTag, { value: "Module" }));
const Users = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { users } = $$props;
  if ($$props.users === void 0 && $$bindings.users && users !== void 0)
    $$bindings.users(users);
  return `${validate_component(Layout, "Layout").$$render($$result, {}, {}, {
    default: () => {
      return `<h1 class="${"text-3xl"}">Users</h1>
  <table><thead><tr><th class="${"px-4 py-2"}">Id</th>
        <th class="${"px-4 py-2"}">Name</th>
        <th class="${"px-4 py-2"}">Email</th></tr></thead>
    <tbody>${each(users, (user) => {
        return `<tr><td class="${"border px-4 py-2"}">${escape(user.id)}</td>
          <td class="${"border px-4 py-2"}">${escape(user.name)}</td>
          <td class="${"border px-4 py-2"}">${escape(user.email)}</td>
        </tr>`;
      })}</tbody></table>`;
    }
  })}`;
});
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
  (page) => createInertiaApp({
    page,
    resolve: (name) => {
      const pages = /* @__PURE__ */ Object.assign({ "./Pages/Home.svelte": __vite_glob_0_0, "./Pages/Users.svelte": __vite_glob_0_1 });
      return pages[`./Pages/${name}.svelte`];
    }
  })
);
