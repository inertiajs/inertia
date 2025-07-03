# View Transition API Integration for Inertia.js

This document describes the implementation of the [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) in Inertia.js, providing smooth animated transitions between page navigations.

## Overview

The View Transition API allows you to create smooth, animated transitions between different states of your application. This implementation adds support for view transitions to Inertia.js visits, enabling beautiful page-to-page animations while maintaining the framework's server-driven approach.

## Browser Support

- **Full Support**: Chrome 111+, Edge 111+, Safari 18+
- **Graceful Fallback**: All other browsers continue to work normally without transitions
- **Progressive Enhancement**: Feature is automatically detected and falls back gracefully

## Implementation Details

### Core Changes

#### 1. New Types (`packages/core/src/types.ts`)

```typescript
// View transition configuration types
export type ViewTransitionOptions = {
  enabled?: boolean
  updateCallback?: () => void | Promise<void>
  onViewTransitionStart?: (transition: any) => void
  onViewTransitionEnd?: (transition: any) => void
  onViewTransitionError?: (error: Error) => void
}

// Extended Visit type to include view transitions
export type Visit<T extends RequestPayload = RequestPayload> = {
  // ...existing properties...
  viewTransition?: ViewTransitionOptions
}
```

#### 2. ViewTransitionManager (`packages/core/src/viewTransition.ts`)

A new class that handles:
- Browser feature detection
- View transition lifecycle management
- Error handling and fallbacks
- Callback execution

```typescript
export class ViewTransitionManager {
  static withViewTransition<T>(
    visit: ActiveVisit, 
    updateCallback: () => Promise<T> | T
  ): Promise<T>
  
  static createFallbackWrapper<T>(
    visit: ActiveVisit, 
    updateCallback: () => Promise<T> | T
  ): Promise<T>
}
```

#### 3. Router Enhancements (`packages/core/src/router.ts`)

- Added `setDefaultViewTransition()` method for global configuration
- Enhanced all visit methods to support view transition options
- Proper merging of default and per-visit options

#### 4. Response Integration (`packages/core/src/response.ts`)

- Wrapped page setting logic with view transition API
- Maintains backward compatibility for non-view-transition requests

#### 5. Event System (`packages/core/src/events.ts`)

New events for monitoring view transition lifecycle:
- `inertia:view-transition-start`
- `inertia:view-transition-end`

## Usage

### Global Configuration

Enable view transitions globally for all navigations:

```typescript
import { router } from '@inertiajs/core'

// Basic global enablement
router.setDefaultViewTransition({ enabled: true })
```

### Per-Visit Configuration

Override global settings for specific navigations:

```typescript
// Using router.visit()
router.visit('/users', {
  viewTransition: {
    enabled: true,
    onViewTransitionStart: (transition) => {
      console.log('Transition started')
    },
    onViewTransitionEnd: (transition) => {
      console.log('Transition completed')
    }
  }
})

// Using helper methods
router.get('/users', {}, {
  viewTransition: { enabled: true }
})
```

### Framework Integration

#### Svelte Example

```svelte
<script>
  import { inertia } from '@inertiajs/svelte'
</script>

<!-- Basic transition -->
<a href="/users" use:inertia={{ viewTransition: { enabled: true } }}>
  Navigate with transition
</a>

<!-- Custom transition with callbacks -->
<a href="/profile" 
   use:inertia={{ 
     viewTransition: { 
       enabled: true,
       onViewTransitionStart: (t) => console.log('Starting transition')
     } 
   }}>
  Navigate to profile
</a>
```

#### React Example

```jsx
import { Link } from '@inertiajs/react'

// Basic transition
<Link href="/users" viewTransition={{ enabled: true }}>
  Navigate with transition
</Link>

// Custom transition with callbacks
<Link 
  href="/profile" 
  viewTransition={{ 
    enabled: true,
    onViewTransitionStart: (t) => console.log('Starting transition')
  }}
>
  Navigate to profile
</Link>
```

### CSS Styling

#### Basic Transition Styling

```css
/* Default cross-fade animation duration */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
}
```

#### Element-Specific Transitions

```css
/* Give specific elements unique transition names */
.header {
  view-transition-name: header;
}

.main-content {
  view-transition-name: content;
}

/* Style individual element transitions */
::view-transition-old(header),
::view-transition-new(header) {
  animation-duration: 0.5s;
}
```

## Configuration Options

### ViewTransitionOptions

| Option | Type | Description |
|--------|------|-------------|
| `enabled` | `boolean` | Whether to enable view transitions for this visit |
| `updateCallback` | `() => void \| Promise<void>` | Custom callback during transition |
| `onViewTransitionStart` | `(transition: ViewTransition) => void` | Called when transition starts |
| `onViewTransitionEnd` | `(transition: ViewTransition) => void` | Called when transition ends |
| `onViewTransitionError` | `(error: Error) => void` | Called if transition fails |

## Events

Listen to view transition events for custom logic:

```javascript
// Listen for transition start
document.addEventListener('inertia:view-transition-start', (event) => {
  console.log('Transition started:', event.detail.transition)
  console.log('Visit details:', event.detail.visit)
})

// Listen for transition end
document.addEventListener('inertia:view-transition-end', (event) => {
  console.log('Transition completed:', event.detail.transition)
})
```

## Examples

### Example 1: Basic Setup

```typescript
// app.js
import { router } from '@inertiajs/core'

// Enable globally
router.setDefaultViewTransition({ enabled: true })
```

```css
/* app.css */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.25s;
}
```

### Example 2: Element-Specific Transitions

```typescript
// Set up shared element transitions
router.visit('/product/123', {
  viewTransition: { 
    enabled: true,
    onViewTransitionStart: (transition) => {
      // Set up shared elements
      document.querySelector('.product-image').style.viewTransitionName = 'product-image'
      document.querySelector('.product-title').style.viewTransitionName = 'product-title'
    }
  }
})
```

```css
/* Shared element transitions */
::view-transition-old(product-image),
::view-transition-new(product-image) {
  object-fit: cover;
  animation-duration: 0.4s;
}

::view-transition-old(product-title),
::view-transition-new(product-title) {
  animation-duration: 0.3s;
  animation-delay: 0.1s;
}
```

## Troubleshooting

### Common Issues

1. **Transitions not working**
   - Check browser support
   - Verify `enabled: true` is set
   - Ensure CSS is properly loaded

2. **Jerky animations**
   - Reduce animation duration
   - Check for conflicting CSS
   - Test on different devices

3. **Memory issues**
   - Avoid setting `view-transition-name` on too many elements
   - Clean up transition names after use
   - Monitor performance in dev tools

### Debugging

```typescript
// Add detailed logging
router.visit('/test', {
  viewTransition: {
    enabled: true,
    onViewTransitionStart: (transition) => {
      console.log('Transition starting:', transition)
    },
    onViewTransitionEnd: (transition) => {
      console.log('Transition complete:', transition)
    },
    onViewTransitionError: (error) => {
      console.error('Transition failed:', error)
    }
  }
})
```

## Migration Guide

### From No Transitions

1. Add global configuration:
```typescript
router.setDefaultViewTransition({ enabled: true })
```

2. Add basic CSS:
```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
}
```

3. Test and refine animations per your design needs.

### From Custom Transition Solutions

1. Remove existing transition JavaScript
2. Convert animations to CSS using view transition pseudo-elements
3. Replace custom triggers with Inertia's view transition options
4. Update event listeners to use Inertia's view transition events
