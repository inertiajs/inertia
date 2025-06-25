<script>
  import { router } from '@inertiajs/svelte'

  export let foo;
  export let bar;

  let replaced = 0;

  const replace = () => {
    router.replace({
      preserveState: true,
      props: (props) => ({ ...props, foo: 'foo from client' }),
      onSuccess: () => replaced++,
    });
  };

  const push = () => {
    router.push({
      url: '/client-side-visit-2',
      component: 'ClientSideVisit/Page2',
      props: { baz: 'baz from client' },
    });
  };
</script>

<div>
  <div>{foo}</div>
  <div>{bar}</div>
  <button on:click={replace}>Replace</button>
  <button on:click={push}>Push</button>
  <div>Replaced: {replaced}</div>
</div>
