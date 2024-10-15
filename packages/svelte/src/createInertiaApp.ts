import { setupProgress, Router, History } from 'inertiax-core';
import escape from 'html-escape';
import Frame from './components/Frame.svelte';
import { BROWSER } from 'esm-env'

export default async function createInertiaApp({
  id = 'app',
  resolve,
  setup,
  progress = {},
  page,
}) {
  const el = BROWSER && document.getElementById(id);
  const initialState = page || JSON.parse(el?.dataset?.page || '{}');
  // Router.setVersion(initialState.version);
  Router.resolveComponent = (name) => Promise.resolve(resolve(name));
  
  if (!BROWSER) {
    const { render } = await dynamicImport('svelte/server');
    const { html, head } = await (async () => {
      return render(Frame, {
        props: {
          name: "_top",
          ...initialState,
        },
      });
    })();

    return {
      body: `<div data-server-rendered="true" id="${id}" data-page="${escape(JSON.stringify(initialState))}">${html}</div>`,
      head: [head],
    };
  }

  History.encryptHistory = initialState.encryptHistory;
  
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
      name: "_top",
      makeRequest: false,
      ...initialState,
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

