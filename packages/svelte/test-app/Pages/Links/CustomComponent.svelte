<script>
  import { Link } from '@inertiajs/svelte'
  import PrimaryButton from './PrimaryButton.svelte'
</script>

<div>
  <h1>Custom Component Link Test</h1>
  
  <p>Regular link as button:</p>
  <Link href="/dump/get" as="button">
    Regular Button
  </Link>
  
  <p>Custom component link:</p>
  <Link href="/dump/get" as={PrimaryButton}>
    Custom Button
  </Link>
</div>