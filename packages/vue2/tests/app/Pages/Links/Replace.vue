<template>
  <div>
    <span class="text">This is the links page that demonstrates replace on inertia-links</span>

    <inertia-link href="/dump/get" replace class="replace">[State] Replace: true</inertia-link>
    <inertia-link href="/dump/get" :replace="false" class="replace-false">[State] Replace: false</inertia-link>
  </div>
</template>
