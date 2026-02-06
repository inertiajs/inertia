<script>
  let { class: className = '', title, children, ...restProps } = $props()
</script>

<div {...restProps} class="rounded-sm border border-gray-300 p-4 text-sm text-gray-500 {className}">
  {#if title}
    <div class="mb-2 font-bold">
      {@render title()}
    </div>
  {/if}

  {@render children()}
</div>
