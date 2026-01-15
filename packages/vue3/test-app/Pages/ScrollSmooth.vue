<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineProps<{
  page: 'long' | 'short'
}>()

// Apply scroll-behavior: smooth to html element immediately
document.documentElement.style.scrollBehavior = 'smooth'
</script>

<template>
  <div class="scroll-smooth-page">
    <div class="header">
      <h1>{{ page === 'long' ? 'Long Page' : 'Short Page' }}</h1>
      <p>Current scroll position: <span id="scroll-position">0</span></p>
    </div>

    <div class="content">
      <div v-for="i in page === 'long' ? 10 : 5" :key="i" class="content-block">
        <h2>Section {{ i }}</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
    </div>

    <div class="navigation">
      <Link v-if="page === 'long'" href="/scroll-smooth/short" class="nav-link"> Go to Short Page </Link>
      <Link v-else href="/scroll-smooth/long" class="nav-link"> Go to Long Page </Link>
    </div>
  </div>
</template>

<style>
.scroll-smooth-page {
  padding: 20px;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 10px 20px;
  border-bottom: 1px solid #ccc;
  z-index: 100;
}

.content {
  margin-top: 80px;
}

.content-block {
  padding: 20px;
  margin: 10px 0;
  background: #f5f5f5;
  border-radius: 4px;
}

.navigation {
  padding: 20px;
  margin-top: 20px;
}

.nav-link {
  display: inline-block;
  padding: 10px 20px;
  background: #4f46e5;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
</style>
