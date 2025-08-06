<script setup>
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Dotted Keys Form Test</h1>

    <!-- Test basic and nested dotted keys -->
    <Form action="/dump/post" method="post">
      <h2>Basic Dotted Keys</h2>
      <input type="text" name="user.name" placeholder="User Name" />
      <input type="text" name="user.profile.city" placeholder="City" />
      <input type="text" name="user.skills[]" placeholder="First Skill" />
      <input type="text" name="user.skills[]" placeholder="Second Skill" />
      <input type="text" name="company.address.street" placeholder="Street" />
      <button type="submit">Submit Basic</button>
    </Form>

    <!-- Test escaped dots (literal keys) -->
    <Form action="/dump/post" method="post">
      <h2>Escaped Dots</h2>
      <input type="text" name="config\.app\.name" placeholder="App Name" />
      <input type="text" name="settings.theme\.mode" placeholder="Theme Mode" />
      <button type="submit">Submit Escaped</button>
    </Form>

    <!-- Test mixed bracket and dotted notation -->
    <Form action="/dump/post" method="post">
      <h2>Mixed Notation</h2>
      <input type="text" name="user[roles][]" value="admin" />
      <input type="text" name="user[roles][]" value="editor" />
      <input type="text" name="settings.ui.theme" placeholder="UI Theme" />
      <button type="submit">Submit Mixed</button>
    </Form>

  </div>
</template>
