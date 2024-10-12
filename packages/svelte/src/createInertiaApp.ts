import { setupProgress } from 'inertiax-core';
import escape from 'html-escape';
import Frame from './components/Frame.svelte';

export default async function createInertiaApp({
  id = 'app',
  resolve,
  setup,
  progress = {},
  page,
}) {
  const isServer = typeof window === 'undefined';
  const el = isServer ? null : document.getElementById(id);
  const initialFrame = page || JSON.parse(el?.dataset?.page || '{}');
  const resolveComponent = (name) => Promise.resolve(resolve(name));
  
  const component = await(resolveComponent(initialFrame.component))
  
  if (isServer) {
    const { render } = await dynamicImport('svelte/server');
    const { html, head, css } = await (async () => {
      if (typeof render === 'function') {
        return render(Frame, {
          props: { initialFrame, resolveComponent, component },
        });
      }
    })();

    return {
      body: `<div data-server-rendered="true" id="${id}" data-page="${escape(JSON.stringify(initialFrame))}">${html}</div>`,
      head: [head, css ? `<style data-vite-css>${css.code}</style>` : ''],
    };
  }

  if (!el) {
    throw new Error(`Element with ID "${id}" not found.`);
  }

  if (progress) {
    setupProgress(progress);
  }

  setup({
    el,
    App: Frame,
    props: {
      component,
      initialFrame,
      resolveComponent,
    },
  });
}

async function dynamicImport(module) {
  try {
    return await import(/* @vite-ignore */ module);
  } catch {
    return null;
  }
}

