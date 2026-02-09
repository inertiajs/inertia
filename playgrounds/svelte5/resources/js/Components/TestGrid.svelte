<script>
  let { class: className = '', children, ...restProps } = $props()
</script>

<div {...restProps} class="mt-6 grid grid-cols-3 gap-4 {className}">
  {@render children()}
</div>
