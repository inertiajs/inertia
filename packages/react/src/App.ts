import { createHeadManager, router } from '@inertiajs/core'
import { createElement, useEffect, useMemo, useState, useCallback } from 'react'
import HeadContext from './HeadContext'
import PageContext from './PageContext'

export default function App({
children,
initialPage,
initialComponent,
resolveComponent,
titleCallback,
onHeadUpdate,
}) {
    const [current, setCurrent] = useState({
        component: initialComponent || null,
        page: initialPage,
        key: null,
    })

    const headManager = useMemo(() => {
        return createHeadManager(
            typeof window === 'undefined',
            titleCallback || ((title) => title),
            onHeadUpdate || (() => {}),
        )
    }, [titleCallback, onHeadUpdate])

    // Use useCallback to optimize effect dependencies
    const swapComponent = useCallback(
        async ({ component, page, preserveState }) => {
            setCurrent((current) => ({
                component,
                page,
                key: preserveState ? current.key : Date.now(),
            }))
        },
        [], // Empty dependency array to prevent unnecessary recreations
    )

    useEffect(() => {
        router.init({
            initialPage,
            resolveComponent,
            swapComponent,
        })

        router.on('navigate', () => headManager.forceUpdate())

        // Cleanup function for useEffect
        return () => router.stop()
    }, [router, headManager, swapComponent]) // Only include dependencies

    if (!current.component) {
        return createElement(
            HeadContext.Provider,
            { value: headManager },
            createElement(PageContext.Provider, { value: current.page }, null),
        )
    }

    const renderChildren =
        children ||
        (({ Component, props, key }) => {
            const child = createElement(Component, { key, ...props })

            if (typeof Component.layout === 'function') {
                return Component.layout(child)
            }

            if (Array.isArray(Component.layout)) {
                return Component.layout
                    .concat(child)
                    .reverse()
                    .reduce((children, Layout) => createElement(Layout, { children, ...props }))
            }

            return child
        })

    return createElement(
        HeadContext.Provider,
        { value: headManager },
        createElement(
            PageContext.Provider,
            { value: current.page },
            renderChildren({
                Component: current.component,
                key: current.key,
                props: current.page.props,
            }),
        ),
    )
}

App.displayName = 'Inertia'
