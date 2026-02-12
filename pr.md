**Commit message:**

```
Fix flash data being cleared by history.replaceState during component swap
```

**PR title:**

```
Fix flash data being cleared when page uses InfiniteScroll
```

**PR description:**

```
When navigating to a page with `<InfiniteScroll>`, the flash event (`router.on('flash')`) was never fired. The `<InfiniteScroll>` component calls `router.remember()` during mount, which triggers `history.replaceState()`, which in turn calls `currentPage.merge()` with `flash: {}` from `getWithoutFlashData()`. This overwrites the flash data that was just set on the page, so by the time `handleSuccess()` checks for flash data, it's already gone.

The fix excludes flash data from the merge in `history.replaceState()`, preventing callers like `router.remember()` from accidentally clearing it. Flash data is only set through `currentPage.set()` (via `this.page = page`), never through `replaceState()` → `merge()`.

Fixes #2856.
```
