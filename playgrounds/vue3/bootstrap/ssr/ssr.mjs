import { ref, shallowRef, createSSRApp, h as h$1, markRaw, reactive, watch, useSSRContext, unref, withCtx, createTextVNode, mergeProps } from "vue";
import { ssrRenderComponent, ssrRenderSlot, ssrRenderAttrs, ssrRenderList, ssrInterpolate } from "vue/server-renderer";
import e from "axios";
import t from "deepmerge";
import { stringify, parse } from "qs";
import r from "nprogress";
import m$1 from "lodash.clonedeep";
import h$2 from "lodash.isequal";
import { createServer } from "http";
import { exit } from "process";
import { renderToString } from "@vue/server-renderer";
function o() {
  return (o = Object.assign ? Object.assign.bind() : function(e2) {
    for (var t2 = 1; t2 < arguments.length; t2++) {
      var n = arguments[t2];
      for (var i in n)
        Object.prototype.hasOwnProperty.call(n, i) && (e2[i] = n[i]);
    }
    return e2;
  }).apply(this, arguments);
}
function s(e2, t2) {
  var n;
  return function() {
    var i = arguments, r2 = this;
    clearTimeout(n), n = setTimeout(function() {
      return e2.apply(r2, [].slice.call(i));
    }, t2);
  };
}
function a(e2, t2) {
  return document.dispatchEvent(new CustomEvent("inertia:" + e2, t2));
}
var l = function(e2) {
  return a("finish", { detail: { visit: e2 } });
}, c = function(e2) {
  return a("navigate", { detail: { page: e2 } });
};
function d(e2, t2, n) {
  for (var i in void 0 === t2 && (t2 = new FormData()), void 0 === n && (n = null), e2 = e2 || {})
    Object.prototype.hasOwnProperty.call(e2, i) && p(t2, u(n, i), e2[i]);
  return t2;
}
function u(e2, t2) {
  return e2 ? e2 + "[" + t2 + "]" : t2;
}
function p(e2, t2, n) {
  return Array.isArray(n) ? Array.from(n.keys()).forEach(function(i) {
    return p(e2, u(t2, i.toString()), n[i]);
  }) : n instanceof Date ? e2.append(t2, n.toISOString()) : n instanceof File ? e2.append(t2, n, n.name) : n instanceof Blob ? e2.append(t2, n) : "boolean" == typeof n ? e2.append(t2, n ? "1" : "0") : "string" == typeof n ? e2.append(t2, n) : "number" == typeof n ? e2.append(t2, "" + n) : null == n ? e2.append(t2, "") : void d(n, e2, t2);
}
var h, f = { modal: null, listener: null, show: function(e2) {
  var t2 = this;
  "object" == typeof e2 && (e2 = "All Inertia requests must receive a valid Inertia response, however a plain JSON response was received.<hr>" + JSON.stringify(e2));
  var n = document.createElement("html");
  n.innerHTML = e2, n.querySelectorAll("a").forEach(function(e3) {
    return e3.setAttribute("target", "_top");
  }), this.modal = document.createElement("div"), this.modal.style.position = "fixed", this.modal.style.width = "100vw", this.modal.style.height = "100vh", this.modal.style.padding = "50px", this.modal.style.boxSizing = "border-box", this.modal.style.backgroundColor = "rgba(0, 0, 0, .6)", this.modal.style.zIndex = 2e5, this.modal.addEventListener("click", function() {
    return t2.hide();
  });
  var i = document.createElement("iframe");
  if (i.style.backgroundColor = "white", i.style.borderRadius = "5px", i.style.width = "100%", i.style.height = "100%", this.modal.appendChild(i), document.body.prepend(this.modal), document.body.style.overflow = "hidden", !i.contentWindow)
    throw new Error("iframe not yet ready.");
  i.contentWindow.document.open(), i.contentWindow.document.write(n.outerHTML), i.contentWindow.document.close(), this.listener = this.hideOnEscape.bind(this), document.addEventListener("keydown", this.listener);
}, hide: function() {
  this.modal.outerHTML = "", this.modal = null, document.body.style.overflow = "visible", document.removeEventListener("keydown", this.listener);
}, hideOnEscape: function(e2) {
  27 === e2.keyCode && this.hide();
} };
function v$1(e2) {
  return new URL(e2.toString(), window.location.toString());
}
function m(e2, r2, o2, s2) {
  void 0 === s2 && (s2 = "brackets");
  var a2 = /^https?:\/\//.test(r2.toString()), l2 = a2 || r2.toString().startsWith("/"), c2 = !l2 && !r2.toString().startsWith("#") && !r2.toString().startsWith("?"), d2 = r2.toString().includes("?") || e2 === h.GET && Object.keys(o2).length, u2 = r2.toString().includes("#"), p2 = new URL(r2.toString(), "http://localhost");
  return e2 === h.GET && Object.keys(o2).length && (p2.search = stringify(t(parse(p2.search, { ignoreQueryPrefix: true }), o2), { encodeValuesOnly: true, arrayFormat: s2 }), o2 = {}), [[a2 ? p2.protocol + "//" + p2.host : "", l2 ? p2.pathname : "", c2 ? p2.pathname.substring(1) : "", d2 ? p2.search : "", u2 ? p2.hash : ""].join(""), o2];
}
function g$1(e2) {
  return (e2 = new URL(e2.href)).hash = "", e2;
}
!function(e2) {
  e2.GET = "get", e2.POST = "post", e2.PUT = "put", e2.PATCH = "patch", e2.DELETE = "delete";
}(h || (h = {}));
var w$1 = "undefined" == typeof window, y$1 = function() {
  function t2() {
    this.visitId = null;
  }
  var n = t2.prototype;
  return n.init = function(e2) {
    var t3 = e2.resolveComponent, n2 = e2.swapComponent;
    this.page = e2.initialPage, this.resolveComponent = t3, this.swapComponent = n2, this.setNavigationType(), this.clearRememberedStateOnReload(), this.isBackForwardVisit() ? this.handleBackForwardVisit(this.page) : this.isLocationVisit() ? this.handleLocationVisit(this.page) : this.handleInitialPageVisit(this.page), this.setupEventListeners();
  }, n.setNavigationType = function() {
    this.navigationType = window.performance && window.performance.getEntriesByType("navigation").length > 0 ? window.performance.getEntriesByType("navigation")[0].type : "navigate";
  }, n.clearRememberedStateOnReload = function() {
    var e2;
    "reload" === this.navigationType && null != (e2 = window.history.state) && e2.rememberedState && delete window.history.state.rememberedState;
  }, n.handleInitialPageVisit = function(e2) {
    this.page.url += window.location.hash, this.setPage(e2, { preserveState: true }).then(function() {
      return c(e2);
    });
  }, n.setupEventListeners = function() {
    window.addEventListener("popstate", this.handlePopstateEvent.bind(this)), document.addEventListener("scroll", s(this.handleScrollEvent.bind(this), 100), true);
  }, n.scrollRegions = function() {
    return document.querySelectorAll("[scroll-region]");
  }, n.handleScrollEvent = function(e2) {
    "function" == typeof e2.target.hasAttribute && e2.target.hasAttribute("scroll-region") && this.saveScrollPositions();
  }, n.saveScrollPositions = function() {
    this.replaceState(o({}, this.page, { scrollRegions: Array.from(this.scrollRegions()).map(function(e2) {
      return { top: e2.scrollTop, left: e2.scrollLeft };
    }) }));
  }, n.resetScrollPositions = function() {
    var e2;
    window.scrollTo(0, 0), this.scrollRegions().forEach(function(e3) {
      "function" == typeof e3.scrollTo ? e3.scrollTo(0, 0) : (e3.scrollTop = 0, e3.scrollLeft = 0);
    }), this.saveScrollPositions(), window.location.hash && (null == (e2 = document.getElementById(window.location.hash.slice(1))) || e2.scrollIntoView());
  }, n.restoreScrollPositions = function() {
    var e2 = this;
    this.page.scrollRegions && this.scrollRegions().forEach(function(t3, n2) {
      var i = e2.page.scrollRegions[n2];
      i && ("function" == typeof t3.scrollTo ? t3.scrollTo(i.left, i.top) : (t3.scrollTop = i.top, t3.scrollLeft = i.left));
    });
  }, n.isBackForwardVisit = function() {
    return window.history.state && "back_forward" === this.navigationType;
  }, n.handleBackForwardVisit = function(e2) {
    var t3 = this;
    window.history.state.version = e2.version, this.setPage(window.history.state, { preserveScroll: true, preserveState: true }).then(function() {
      t3.restoreScrollPositions(), c(e2);
    });
  }, n.locationVisit = function(e2, t3) {
    try {
      window.sessionStorage.setItem("inertiaLocationVisit", JSON.stringify({ preserveScroll: t3 })), window.location.href = e2.href, g$1(window.location).href === g$1(e2).href && window.location.reload();
    } catch (e3) {
      return false;
    }
  }, n.isLocationVisit = function() {
    try {
      return null !== window.sessionStorage.getItem("inertiaLocationVisit");
    } catch (e2) {
      return false;
    }
  }, n.handleLocationVisit = function(e2) {
    var t3, n2, i, r2, o2 = this, s2 = JSON.parse(window.sessionStorage.getItem("inertiaLocationVisit") || "");
    window.sessionStorage.removeItem("inertiaLocationVisit"), e2.url += window.location.hash, e2.rememberedState = null != (t3 = null == (n2 = window.history.state) ? void 0 : n2.rememberedState) ? t3 : {}, e2.scrollRegions = null != (i = null == (r2 = window.history.state) ? void 0 : r2.scrollRegions) ? i : [], this.setPage(e2, { preserveScroll: s2.preserveScroll, preserveState: true }).then(function() {
      s2.preserveScroll && o2.restoreScrollPositions(), c(e2);
    });
  }, n.isLocationVisitResponse = function(e2) {
    return !(!e2 || 409 !== e2.status || !e2.headers["x-inertia-location"]);
  }, n.isInertiaResponse = function(e2) {
    return !(null == e2 || !e2.headers["x-inertia"]);
  }, n.createVisitId = function() {
    return this.visitId = {}, this.visitId;
  }, n.cancelVisit = function(e2, t3) {
    var n2 = t3.cancelled, i = void 0 !== n2 && n2, r2 = t3.interrupted, o2 = void 0 !== r2 && r2;
    !e2 || e2.completed || e2.cancelled || e2.interrupted || (e2.cancelToken.cancel(), e2.onCancel(), e2.completed = false, e2.cancelled = i, e2.interrupted = o2, l(e2), e2.onFinish(e2));
  }, n.finishVisit = function(e2) {
    e2.cancelled || e2.interrupted || (e2.completed = true, e2.cancelled = false, e2.interrupted = false, l(e2), e2.onFinish(e2));
  }, n.resolvePreserveOption = function(e2, t3) {
    return "function" == typeof e2 ? e2(t3) : "errors" === e2 ? Object.keys(t3.props.errors || {}).length > 0 : e2;
  }, n.visit = function(t3, n2) {
    var i = this, r2 = void 0 === n2 ? {} : n2, s2 = r2.method, l2 = void 0 === s2 ? h.GET : s2, c2 = r2.data, u2 = void 0 === c2 ? {} : c2, p2 = r2.replace, w2 = void 0 !== p2 && p2, y2 = r2.preserveScroll, S2 = void 0 !== y2 && y2, b2 = r2.preserveState, E2 = void 0 !== b2 && b2, x2 = r2.only, T2 = void 0 === x2 ? [] : x2, P2 = r2.headers, V2 = void 0 === P2 ? {} : P2, L2 = r2.errorBag, k2 = void 0 === L2 ? "" : L2, I2 = r2.forceFormData, O = void 0 !== I2 && I2, C2 = r2.onCancelToken, R = void 0 === C2 ? function() {
    } : C2, A = r2.onBefore, F = void 0 === A ? function() {
    } : A, j2 = r2.onStart, M = void 0 === j2 ? function() {
    } : j2, D = r2.onProgress, N = void 0 === D ? function() {
    } : D, B = r2.onFinish, q = void 0 === B ? function() {
    } : B, H = r2.onCancel, W = void 0 === H ? function() {
    } : H, G = r2.onSuccess, U = void 0 === G ? function() {
    } : G, X = r2.onError, z = void 0 === X ? function() {
    } : X, J = r2.queryStringArrayFormat, K = void 0 === J ? "brackets" : J, _2 = "string" == typeof t3 ? v$1(t3) : t3;
    if (!function e2(t4) {
      return t4 instanceof File || t4 instanceof Blob || t4 instanceof FileList && t4.length > 0 || t4 instanceof FormData && Array.from(t4.values()).some(function(t5) {
        return e2(t5);
      }) || "object" == typeof t4 && null !== t4 && Object.values(t4).some(function(t5) {
        return e2(t5);
      });
    }(u2) && !O || u2 instanceof FormData || (u2 = d(u2)), !(u2 instanceof FormData)) {
      var Q = m(l2, _2, u2, K), Y = Q[1];
      _2 = v$1(Q[0]), u2 = Y;
    }
    var Z = { url: _2, method: l2, data: u2, replace: w2, preserveScroll: S2, preserveState: E2, only: T2, headers: V2, errorBag: k2, forceFormData: O, queryStringArrayFormat: K, cancelled: false, completed: false, interrupted: false };
    if (false !== F(Z) && function(e2) {
      return a("before", { cancelable: true, detail: { visit: e2 } });
    }(Z)) {
      this.activeVisit && this.cancelVisit(this.activeVisit, { interrupted: true }), this.saveScrollPositions();
      var $ = this.createVisitId();
      this.activeVisit = o({}, Z, { onCancelToken: R, onBefore: F, onStart: M, onProgress: N, onFinish: q, onCancel: W, onSuccess: U, onError: z, queryStringArrayFormat: K, cancelToken: e.CancelToken.source() }), R({ cancel: function() {
        i.activeVisit && i.cancelVisit(i.activeVisit, { cancelled: true });
      } }), function(e2) {
        a("start", { detail: { visit: e2 } });
      }(Z), M(Z), e({ method: l2, url: g$1(_2).href, data: l2 === h.GET ? {} : u2, params: l2 === h.GET ? u2 : {}, cancelToken: this.activeVisit.cancelToken.token, headers: o({}, V2, { Accept: "text/html, application/xhtml+xml", "X-Requested-With": "XMLHttpRequest", "X-Inertia": true }, T2.length ? { "X-Inertia-Partial-Component": this.page.component, "X-Inertia-Partial-Data": T2.join(",") } : {}, k2 && k2.length ? { "X-Inertia-Error-Bag": k2 } : {}, this.page.version ? { "X-Inertia-Version": this.page.version } : {}), onUploadProgress: function(e2) {
        u2 instanceof FormData && (e2.percentage = Math.round(e2.loaded / e2.total * 100), function(e3) {
          a("progress", { detail: { progress: e3 } });
        }(e2), N(e2));
      } }).then(function(e2) {
        var t4;
        if (!i.isInertiaResponse(e2))
          return Promise.reject({ response: e2 });
        var n3 = e2.data;
        T2.length && n3.component === i.page.component && (n3.props = o({}, i.page.props, n3.props)), S2 = i.resolvePreserveOption(S2, n3), (E2 = i.resolvePreserveOption(E2, n3)) && null != (t4 = window.history.state) && t4.rememberedState && n3.component === i.page.component && (n3.rememberedState = window.history.state.rememberedState);
        var r3 = _2, s3 = v$1(n3.url);
        return r3.hash && !s3.hash && g$1(r3).href === s3.href && (s3.hash = r3.hash, n3.url = s3.href), i.setPage(n3, { visitId: $, replace: w2, preserveScroll: S2, preserveState: E2 });
      }).then(function() {
        var e2 = i.page.props.errors || {};
        if (Object.keys(e2).length > 0) {
          var t4 = k2 ? e2[k2] ? e2[k2] : {} : e2;
          return function(e3) {
            a("error", { detail: { errors: e3 } });
          }(t4), z(t4);
        }
        return a("success", { detail: { page: i.page } }), U(i.page);
      }).catch(function(e2) {
        if (i.isInertiaResponse(e2.response))
          return i.setPage(e2.response.data, { visitId: $ });
        if (i.isLocationVisitResponse(e2.response)) {
          var t4 = v$1(e2.response.headers["x-inertia-location"]), n3 = _2;
          n3.hash && !t4.hash && g$1(n3).href === t4.href && (t4.hash = n3.hash), i.locationVisit(t4, true === S2);
        } else {
          if (!e2.response)
            return Promise.reject(e2);
          a("invalid", { cancelable: true, detail: { response: e2.response } }) && f.show(e2.response.data);
        }
      }).then(function() {
        i.activeVisit && i.finishVisit(i.activeVisit);
      }).catch(function(t4) {
        if (!e.isCancel(t4)) {
          var n3 = a("exception", { cancelable: true, detail: { exception: t4 } });
          if (i.activeVisit && i.finishVisit(i.activeVisit), n3)
            return Promise.reject(t4);
        }
      });
    }
  }, n.setPage = function(e2, t3) {
    var n2 = this, i = void 0 === t3 ? {} : t3, r2 = i.visitId, o2 = void 0 === r2 ? this.createVisitId() : r2, s2 = i.replace, a2 = void 0 !== s2 && s2, l2 = i.preserveScroll, d2 = void 0 !== l2 && l2, u2 = i.preserveState, p2 = void 0 !== u2 && u2;
    return Promise.resolve(this.resolveComponent(e2.component)).then(function(t4) {
      o2 === n2.visitId && (e2.scrollRegions = e2.scrollRegions || [], e2.rememberedState = e2.rememberedState || {}, (a2 = a2 || v$1(e2.url).href === window.location.href) ? n2.replaceState(e2) : n2.pushState(e2), n2.swapComponent({ component: t4, page: e2, preserveState: p2 }).then(function() {
        d2 || n2.resetScrollPositions(), a2 || c(e2);
      }));
    });
  }, n.pushState = function(e2) {
    this.page = e2, window.history.pushState(e2, "", e2.url);
  }, n.replaceState = function(e2) {
    this.page = e2, window.history.replaceState(e2, "", e2.url);
  }, n.handlePopstateEvent = function(e2) {
    var t3 = this;
    if (null !== e2.state) {
      var n2 = e2.state, i = this.createVisitId();
      Promise.resolve(this.resolveComponent(n2.component)).then(function(e3) {
        i === t3.visitId && (t3.page = n2, t3.swapComponent({ component: e3, page: n2, preserveState: false }).then(function() {
          t3.restoreScrollPositions(), c(n2);
        }));
      });
    } else {
      var r2 = v$1(this.page.url);
      r2.hash = window.location.hash, this.replaceState(o({}, this.page, { url: r2.href })), this.resetScrollPositions();
    }
  }, n.get = function(e2, t3, n2) {
    return void 0 === t3 && (t3 = {}), void 0 === n2 && (n2 = {}), this.visit(e2, o({}, n2, { method: h.GET, data: t3 }));
  }, n.reload = function(e2) {
    return void 0 === e2 && (e2 = {}), this.visit(window.location.href, o({}, e2, { preserveScroll: true, preserveState: true }));
  }, n.replace = function(e2, t3) {
    var n2;
    return void 0 === t3 && (t3 = {}), console.warn("Inertia.replace() has been deprecated and will be removed in a future release. Please use Inertia." + (null != (n2 = t3.method) ? n2 : "get") + "() instead."), this.visit(e2, o({ preserveState: true }, t3, { replace: true }));
  }, n.post = function(e2, t3, n2) {
    return void 0 === t3 && (t3 = {}), void 0 === n2 && (n2 = {}), this.visit(e2, o({ preserveState: true }, n2, { method: h.POST, data: t3 }));
  }, n.put = function(e2, t3, n2) {
    return void 0 === t3 && (t3 = {}), void 0 === n2 && (n2 = {}), this.visit(e2, o({ preserveState: true }, n2, { method: h.PUT, data: t3 }));
  }, n.patch = function(e2, t3, n2) {
    return void 0 === t3 && (t3 = {}), void 0 === n2 && (n2 = {}), this.visit(e2, o({ preserveState: true }, n2, { method: h.PATCH, data: t3 }));
  }, n.delete = function(e2, t3) {
    return void 0 === t3 && (t3 = {}), this.visit(e2, o({ preserveState: true }, t3, { method: h.DELETE }));
  }, n.remember = function(e2, t3) {
    var n2, i;
    void 0 === t3 && (t3 = "default"), w$1 || this.replaceState(o({}, this.page, { rememberedState: o({}, null == (n2 = this.page) ? void 0 : n2.rememberedState, (i = {}, i[t3] = e2, i)) }));
  }, n.restore = function(e2) {
    var t3, n2;
    if (void 0 === e2 && (e2 = "default"), !w$1)
      return null == (t3 = window.history.state) || null == (n2 = t3.rememberedState) ? void 0 : n2[e2];
  }, n.on = function(e2, t3) {
    var n2 = function(e3) {
      var n3 = t3(e3);
      e3.cancelable && !e3.defaultPrevented && false === n3 && e3.preventDefault();
    };
    return document.addEventListener("inertia:" + e2, n2), function() {
      return document.removeEventListener("inertia:" + e2, n2);
    };
  }, t2;
}(), S$1 = { buildDOMElement: function(e2) {
  var t2 = document.createElement("template");
  t2.innerHTML = e2;
  var n = t2.content.firstChild;
  if (!e2.startsWith("<script "))
    return n;
  var i = document.createElement("script");
  return i.innerHTML = n.innerHTML, n.getAttributeNames().forEach(function(e3) {
    i.setAttribute(e3, n.getAttribute(e3) || "");
  }), i;
}, isInertiaManagedElement: function(e2) {
  return e2.nodeType === Node.ELEMENT_NODE && null !== e2.getAttribute("inertia");
}, findMatchingElementIndex: function(e2, t2) {
  var n = e2.getAttribute("inertia");
  return null !== n ? t2.findIndex(function(e3) {
    return e3.getAttribute("inertia") === n;
  }) : -1;
}, update: s(function(e2) {
  var t2 = this, n = e2.map(function(e3) {
    return t2.buildDOMElement(e3);
  });
  Array.from(document.head.childNodes).filter(function(e3) {
    return t2.isInertiaManagedElement(e3);
  }).forEach(function(e3) {
    var i = t2.findMatchingElementIndex(e3, n);
    if (-1 !== i) {
      var r2, o2 = n.splice(i, 1)[0];
      o2 && !e3.isEqualNode(o2) && (null == e3 || null == (r2 = e3.parentNode) || r2.replaceChild(o2, e3));
    } else {
      var s2;
      null == e3 || null == (s2 = e3.parentNode) || s2.removeChild(e3);
    }
  }), n.forEach(function(e3) {
    return document.head.appendChild(e3);
  });
}, 1) };
function b$1(e2, t2, n) {
  var i = {}, r2 = 0;
  function s2() {
    var e3 = t2(""), n2 = o({}, e3 ? { title: '<title inertia="">' + e3 + "</title>" } : {}), r3 = Object.values(i).reduce(function(e4, t3) {
      return e4.concat(t3);
    }, []).reduce(function(e4, n3) {
      if (-1 === n3.indexOf("<"))
        return e4;
      if (0 === n3.indexOf("<title ")) {
        var i2 = n3.match(/(<title [^>]+>)(.*?)(<\/title>)/);
        return e4.title = i2 ? "" + i2[1] + t2(i2[2]) + i2[3] : n3, e4;
      }
      var r4 = n3.match(/ inertia="[^"]+"/);
      return r4 ? e4[r4[0]] = n3 : e4[Object.keys(e4).length] = n3, e4;
    }, n2);
    return Object.values(r3);
  }
  function a2() {
    e2 ? n(s2()) : S$1.update(s2());
  }
  return a2(), { forceUpdate: a2, createProvider: function() {
    var e3 = function() {
      var e4 = r2 += 1;
      return i[e4] = [], e4.toString();
    }();
    return { update: function(t3) {
      return function(e4, t4) {
        void 0 === t4 && (t4 = []), null !== e4 && Object.keys(i).indexOf(e4) > -1 && (i[e4] = t4), a2();
      }(e3, t3);
    }, disconnect: function() {
      return function(e4) {
        null !== e4 && -1 !== Object.keys(i).indexOf(e4) && (delete i[e4], a2());
      }(e3);
    } };
  } };
}
var E$1 = null;
function x(e2) {
  document.addEventListener("inertia:start", T$1.bind(null, e2)), document.addEventListener("inertia:progress", P$1), document.addEventListener("inertia:finish", V);
}
function T$1(e2) {
  E$1 = setTimeout(function() {
    return r.start();
  }, e2);
}
function P$1(e2) {
  var t2;
  r.isStarted() && null != (t2 = e2.detail.progress) && t2.percentage && r.set(Math.max(r.status, e2.detail.progress.percentage / 100 * 0.9));
}
function V(e2) {
  clearTimeout(E$1), r.isStarted() && (e2.detail.visit.completed ? r.done() : e2.detail.visit.interrupted ? r.set(0) : e2.detail.visit.cancelled && (r.done(), r.remove()));
}
function L(e2) {
  var t2 = void 0 === e2 ? {} : e2, n = t2.delay, i = t2.color, o2 = void 0 === i ? "#29d" : i, s2 = t2.includeCSS, a2 = void 0 === s2 || s2, l2 = t2.showSpinner, c2 = void 0 !== l2 && l2;
  x(void 0 === n ? 250 : n), r.configure({ showSpinner: c2 }), a2 && function(e3) {
    var t3 = document.createElement("style");
    t3.type = "text/css", t3.textContent = "\n    #nprogress {\n      pointer-events: none;\n    }\n\n    #nprogress .bar {\n      background: " + e3 + ";\n\n      position: fixed;\n      z-index: 1031;\n      top: 0;\n      left: 0;\n\n      width: 100%;\n      height: 2px;\n    }\n\n    #nprogress .peg {\n      display: block;\n      position: absolute;\n      right: 0px;\n      width: 100px;\n      height: 100%;\n      box-shadow: 0 0 10px " + e3 + ", 0 0 5px " + e3 + ";\n      opacity: 1.0;\n\n      -webkit-transform: rotate(3deg) translate(0px, -4px);\n          -ms-transform: rotate(3deg) translate(0px, -4px);\n              transform: rotate(3deg) translate(0px, -4px);\n    }\n\n    #nprogress .spinner {\n      display: block;\n      position: fixed;\n      z-index: 1031;\n      top: 15px;\n      right: 15px;\n    }\n\n    #nprogress .spinner-icon {\n      width: 18px;\n      height: 18px;\n      box-sizing: border-box;\n\n      border: solid 2px transparent;\n      border-top-color: " + e3 + ";\n      border-left-color: " + e3 + ";\n      border-radius: 50%;\n\n      -webkit-animation: nprogress-spinner 400ms linear infinite;\n              animation: nprogress-spinner 400ms linear infinite;\n    }\n\n    .nprogress-custom-parent {\n      overflow: hidden;\n      position: relative;\n    }\n\n    .nprogress-custom-parent #nprogress .spinner,\n    .nprogress-custom-parent #nprogress .bar {\n      position: absolute;\n    }\n\n    @-webkit-keyframes nprogress-spinner {\n      0%   { -webkit-transform: rotate(0deg); }\n      100% { -webkit-transform: rotate(360deg); }\n    }\n    @keyframes nprogress-spinner {\n      0%   { transform: rotate(0deg); }\n      100% { transform: rotate(360deg); }\n    }\n  ", document.head.appendChild(t3);
  }(o2);
}
function k$1(e2) {
  var t2 = "a" === e2.currentTarget.tagName.toLowerCase();
  return !(e2.target && null != e2 && e2.target.isContentEditable || e2.defaultPrevented || t2 && e2.which > 1 || t2 && e2.altKey || t2 && e2.ctrlKey || t2 && e2.metaKey || t2 && e2.shiftKey);
}
var I = new y$1();
function v() {
  return (v = Object.assign ? Object.assign.bind() : function(e2) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t2 = arguments[r2];
      for (var n in t2)
        Object.prototype.hasOwnProperty.call(t2, n) && (e2[n] = t2[n]);
    }
    return e2;
  }).apply(this, arguments);
}
var y = { created: function() {
  var r2 = this;
  if (this.$options.remember) {
    Array.isArray(this.$options.remember) && (this.$options.remember = { data: this.$options.remember }), "string" == typeof this.$options.remember && (this.$options.remember = { data: [this.$options.remember] }), "string" == typeof this.$options.remember.data && (this.$options.remember = { data: [this.$options.remember.data] });
    var t2 = this.$options.remember.key instanceof Function ? this.$options.remember.key.call(this) : this.$options.remember.key, n = I.restore(t2), o2 = this.$options.remember.data.filter(function(e2) {
      return !(null !== r2[e2] && "object" == typeof r2[e2] && false === r2[e2].__rememberable);
    }), i = function(e2) {
      return null !== r2[e2] && "object" == typeof r2[e2] && "function" == typeof r2[e2].__remember && "function" == typeof r2[e2].__restore;
    };
    o2.forEach(function(u2) {
      void 0 !== r2[u2] && void 0 !== n && void 0 !== n[u2] && (i(u2) ? r2[u2].__restore(n[u2]) : r2[u2] = n[u2]), r2.$watch(u2, function() {
        I.remember(o2.reduce(function(e2, t3) {
          var n2;
          return v({}, e2, ((n2 = {})[t3] = m$1(i(t3) ? r2[t3].__remember() : r2[t3]), n2));
        }, {}), t2);
      }, { immediate: true, deep: true });
    });
  }
} };
function g() {
  var r2 = [].slice.call(arguments), t2 = "string" == typeof r2[0] ? r2[0] : null, n = ("string" == typeof r2[0] ? r2[1] : r2[0]) || {}, o2 = t2 ? I.restore(t2) : null, s2 = m$1(n), a2 = null, c2 = null, l2 = function(e2) {
    return e2;
  }, f2 = reactive(v({}, o2 ? o2.data : n, { isDirty: false, errors: o2 ? o2.errors : {}, hasErrors: false, processing: false, progress: null, wasSuccessful: false, recentlySuccessful: false, data: function() {
    var e2 = this;
    return Object.keys(n).reduce(function(r3, t3) {
      return r3[t3] = e2[t3], r3;
    }, {});
  }, transform: function(e2) {
    return l2 = e2, this;
  }, defaults: function(e2, r3) {
    var t3;
    return s2 = void 0 === e2 ? this.data() : Object.assign({}, m$1(s2), r3 ? ((t3 = {})[e2] = r3, t3) : e2), this;
  }, reset: function() {
    var e2 = [].slice.call(arguments), r3 = m$1(s2);
    return Object.assign(this, 0 === e2.length ? r3 : Object.keys(r3).filter(function(r4) {
      return e2.includes(r4);
    }).reduce(function(e3, t3) {
      return e3[t3] = r3[t3], e3;
    }, {})), this;
  }, setError: function(e2, r3) {
    var t3;
    return Object.assign(this.errors, r3 ? ((t3 = {})[e2] = r3, t3) : e2), this.hasErrors = Object.keys(this.errors).length > 0, this;
  }, clearErrors: function() {
    var e2 = this, r3 = [].slice.call(arguments);
    return this.errors = Object.keys(this.errors).reduce(function(t3, n2) {
      var o3;
      return v({}, t3, r3.length > 0 && !r3.includes(n2) ? ((o3 = {})[n2] = e2.errors[n2], o3) : {});
    }, {}), this.hasErrors = Object.keys(this.errors).length > 0, this;
  }, submit: function(r3, t3, n2) {
    var o3 = this, i = this;
    void 0 === n2 && (n2 = {});
    var u2 = l2(this.data()), f3 = v({}, n2, { onCancelToken: function(e2) {
      if (a2 = e2, n2.onCancelToken)
        return n2.onCancelToken(e2);
    }, onBefore: function(e2) {
      if (i.wasSuccessful = false, i.recentlySuccessful = false, clearTimeout(c2), n2.onBefore)
        return n2.onBefore(e2);
    }, onStart: function(e2) {
      if (i.processing = true, n2.onStart)
        return n2.onStart(e2);
    }, onProgress: function(e2) {
      if (i.progress = e2, n2.onProgress)
        return n2.onProgress(e2);
    }, onSuccess: function(e2) {
      try {
        var r4 = function(e3) {
          return s2 = m$1(o3.data()), o3.isDirty = false, e3;
        };
        return o3.processing = false, o3.progress = null, o3.clearErrors(), o3.wasSuccessful = true, o3.recentlySuccessful = true, c2 = setTimeout(function() {
          return o3.recentlySuccessful = false;
        }, 2e3), Promise.resolve(n2.onSuccess ? Promise.resolve(n2.onSuccess(e2)).then(r4) : r4(null));
      } catch (e3) {
        return Promise.reject(e3);
      }
    }, onError: function(e2) {
      if (i.processing = false, i.progress = null, i.clearErrors().setError(e2), n2.onError)
        return n2.onError(e2);
    }, onCancel: function() {
      if (i.processing = false, i.progress = null, n2.onCancel)
        return n2.onCancel();
    }, onFinish: function() {
      if (i.processing = false, i.progress = null, a2 = null, n2.onFinish)
        return n2.onFinish();
    } });
    "delete" === r3 ? I.delete(t3, v({}, f3, { data: u2 })) : I[r3](t3, u2, f3);
  }, get: function(e2, r3) {
    this.submit("get", e2, r3);
  }, post: function(e2, r3) {
    this.submit("post", e2, r3);
  }, put: function(e2, r3) {
    this.submit("put", e2, r3);
  }, patch: function(e2, r3) {
    this.submit("patch", e2, r3);
  }, delete: function(e2, r3) {
    this.submit("delete", e2, r3);
  }, cancel: function() {
    a2 && a2.cancel();
  }, __rememberable: null === t2, __remember: function() {
    return { data: this.data(), errors: this.errors };
  }, __restore: function(e2) {
    Object.assign(this, e2.data), this.setError(e2.errors);
  } }));
  return watch(f2, function(r3) {
    f2.isDirty = !h$2(f2.data(), s2), t2 && I.remember(m$1(r3.__remember()), t2);
  }, { immediate: true, deep: true }), f2;
}
var b = ref(null), S = ref({}), k = shallowRef(null), P = ref(null), C = null, j = { name: "Inertia", props: { initialPage: { type: Object, required: true }, initialComponent: { type: Object, required: false }, resolveComponent: { type: Function, required: false }, titleCallback: { type: Function, required: false, default: function(e2) {
  return e2;
} }, onHeadUpdate: { type: Function, required: false, default: function() {
  return function() {
  };
} } }, setup: function(t2) {
  var n = t2.initialPage, o2 = t2.initialComponent, i = t2.resolveComponent, u2 = t2.titleCallback, s2 = t2.onHeadUpdate;
  b.value = o2 ? markRaw(o2) : null, S.value = n, P.value = null;
  var a2 = "undefined" == typeof window;
  return C = b$1(a2, u2, s2), a2 || (I.init({ initialPage: n, resolveComponent: i, swapComponent: function(e2) {
    try {
      return b.value = markRaw(e2.component), S.value = e2.page, P.value = e2.preserveState ? P.value : Date.now(), Promise.resolve();
    } catch (e3) {
      return Promise.reject(e3);
    }
  } }), I.on("navigate", function() {
    return C.forceUpdate();
  })), function() {
    if (b.value) {
      b.value.inheritAttrs = !!b.value.inheritAttrs;
      var e2 = h$1(b.value, v({}, S.value.props, { key: P.value }));
      return k.value && (b.value.layout = k.value, k.value = null), b.value.layout ? "function" == typeof b.value.layout ? b.value.layout(h$1, e2) : (Array.isArray(b.value.layout) ? b.value.layout : [b.value.layout]).concat(e2).reverse().reduce(function(e3, r2) {
        return r2.inheritAttrs = !!r2.inheritAttrs, h$1(r2, v({}, S.value.props), function() {
          return e3;
        });
      }) : e2;
    }
  };
} }, _ = { install: function(r2) {
  I.form = g, Object.defineProperty(r2.config.globalProperties, "$inertia", { get: function() {
    return I;
  } }), Object.defineProperty(r2.config.globalProperties, "$page", { get: function() {
    return S.value;
  } }), Object.defineProperty(r2.config.globalProperties, "$headManager", { get: function() {
    return C;
  } }), r2.mixin(y);
} };
function T(e2) {
  k.value = e2;
}
var E = function(e2) {
  try {
    var r2, n, o2, i, u2, s2, a2, c2, l2;
    n = void 0 === (r2 = e2.id) ? "app" : r2, o2 = e2.resolve, i = e2.setup, u2 = e2.title, a2 = void 0 === (s2 = e2.progress) ? {} : s2, c2 = e2.page, l2 = e2.render;
    var d2 = "undefined" == typeof window, m2 = d2 ? null : document.getElementById(n), h2 = c2 || JSON.parse(m2.dataset.page), v2 = function(e3) {
      return Promise.resolve(o2(e3)).then(function(e4) {
        return e4.default || e4;
      });
    }, y2 = [];
    return Promise.resolve(v2(h2.component).then(function(e3) {
      return i({ el: m2, App: j, props: { initialPage: h2, initialComponent: e3, resolveComponent: v2, titleCallback: u2, onHeadUpdate: d2 ? function(e4) {
        return y2 = e4;
      } : null }, plugin: _ });
    })).then(function(e3) {
      return !d2 && a2 && L(a2), function() {
        if (d2)
          return Promise.resolve(l2(createSSRApp({ render: function() {
            return h$1("div", { id: n, "data-page": JSON.stringify(h2), innerHTML: l2(e3) });
          } }))).then(function(e4) {
            return { head: y2, body: e4 };
          });
      }();
    });
  } catch (e3) {
    return Promise.reject(e3);
  }
}, w = { name: "Link", props: { as: { type: String, default: "a" }, data: { type: Object, default: function() {
  return {};
} }, href: { type: String }, method: { type: String, default: "get" }, replace: { type: Boolean, default: false }, preserveScroll: { type: Boolean, default: false }, preserveState: { type: Boolean, default: null }, only: { type: Array, default: function() {
  return [];
} }, headers: { type: Object, default: function() {
  return {};
} }, queryStringArrayFormat: { type: String, default: "brackets" } }, setup: function(r2, t2) {
  var i = t2.slots, u2 = t2.attrs;
  return function(r3) {
    var t3 = r3.as.toLowerCase(), s2 = r3.method.toLowerCase(), a2 = m(s2, r3.href || "", r3.data, r3.queryStringArrayFormat), c2 = a2[0], l2 = a2[1];
    return "a" === t3 && "get" !== s2 && console.warn('Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.\n\nPlease specify a more appropriate element using the "as" attribute. For example:\n\n<Link href="' + c2 + '" method="' + s2 + '" as="button">...</Link>'), h$1(r3.as, v({}, u2, "a" === t3 ? { href: c2 } : {}, { onClick: function(t4) {
      var n;
      k$1(t4) && (t4.preventDefault(), I.visit(c2, { data: l2, method: s2, replace: r3.replace, preserveScroll: r3.preserveScroll, preserveState: null != (n = r3.preserveState) ? n : "get" !== s2, only: r3.only, headers: r3.headers, onCancelToken: u2.onCancelToken || function() {
        return {};
      }, onBefore: u2.onBefore || function() {
        return {};
      }, onStart: u2.onStart || function() {
        return {};
      }, onProgress: u2.onProgress || function() {
        return {};
      }, onFinish: u2.onFinish || function() {
        return {};
      }, onCancel: u2.onCancel || function() {
        return {};
      }, onSuccess: u2.onSuccess || function() {
        return {};
      }, onError: u2.onError || function() {
        return {};
      } }));
    } }), i);
  };
} };
const _sfc_main$2 = {
  __name: "Layout",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><nav class="space-x-6 bg-slate-800 p-6 text-white">`);
      _push(ssrRenderComponent(unref(w), { href: "/" }, {
        default: withCtx((_2, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Home`);
          } else {
            return [
              createTextVNode("Home")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(unref(w), { href: "/users" }, {
        default: withCtx((_2, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Users`);
          } else {
            return [
              createTextVNode("Users")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</nav><main class="p-6">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main><!--]-->`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Layout.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$1 = {
  layout: _sfc_main$2
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<h1${ssrRenderAttrs(mergeProps({ class: "text-3xl" }, _attrs))}>Home</h1>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Home.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const Home = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender]]);
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Home
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main = {
  __name: "Users",
  __ssrInlineRender: true,
  props: ["users"],
  setup(__props) {
    T(_sfc_main$2);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><h1 class="text-3xl">Users</h1><table><thead><tr><th class="px-4 py-2">Id</th><th class="px-4 py-2">Name</th><th class="px-4 py-2">Email</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(__props.users, (user) => {
        _push(`<tr><td class="border px-4 py-2">${ssrInterpolate(user.id)}</td><td class="border px-4 py-2">${ssrInterpolate(user.name)}</td><td class="border px-4 py-2">${ssrInterpolate(user.email)}</td></tr>`);
      });
      _push(`<!--]--></tbody></table><!--]-->`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Users.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main
}, Symbol.toStringTag, { value: "Module" }));
const readableToString = (readable) => new Promise((resolve, reject) => {
  let data = "";
  readable.on("data", (chunk) => data += chunk);
  readable.on("end", () => resolve(data));
  readable.on("error", (err) => reject(err));
});
var server = (render, port) => {
  const _port = port || 13714;
  const routes = {
    "/health": async () => ({
      status: "OK",
      timestamp: Date.now()
    }),
    "/shutdown": () => exit(),
    "/render": async (request) => render(JSON.parse(await readableToString(request))),
    "/404": async () => ({
      status: "NOT_FOUND",
      timestamp: Date.now()
    })
  };
  createServer(async (request, response) => {
    const dispatchRoute = routes[request.url] || routes["/404"];
    try {
      response.writeHead(200, {
        "Content-Type": "application/json",
        Server: "Inertia.js SSR"
      });
      response.write(JSON.stringify(await dispatchRoute(request)));
    } catch (e2) {
      console.error(e2);
    }
    response.end();
  }).listen(_port, () => console.log("Inertia SSR server started."));
  console.log(`Starting SSR server on port ${_port}...`);
};
server(
  (page) => E({
    page,
    render: renderToString,
    resolve: (name) => {
      const pages = /* @__PURE__ */ Object.assign({ "./Pages/Home.vue": __vite_glob_0_0, "./Pages/Users.vue": __vite_glob_0_1 });
      return pages[`./Pages/${name}.vue`];
    },
    setup({ App, props, plugin }) {
      return createSSRApp({
        render: () => h$1(App, props)
      }).use(plugin);
    }
  })
);
