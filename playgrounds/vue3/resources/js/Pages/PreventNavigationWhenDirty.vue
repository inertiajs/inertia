<script setup lang="ts">
import { Form, Head, Link, useForm } from '@inertiajs/vue3'

const form = useForm({ name: '' }).preventNavigationWhenDirty()
</script>

<template>
  <Head title="Unsaved Changes" />
  <h1 class="text-3xl">Unsaved Changes</h1>

  <div class="mt-6 max-w-2xl space-y-8">
    <section class="space-y-4">
      <h2 class="text-xl font-medium">useForm</h2>
      <p class="text-sm text-gray-600">
        Form is
        <span v-if="form.isDirty" class="font-medium text-amber-700">dirty</span>
        <span v-else class="font-medium text-gray-500">clean</span>
      </p>

      <div v-if="form.isDirty" class="rounded-sm border border-amber-100 bg-amber-50 p-3 text-amber-800">
        There are unsaved changes!
      </div>

      <div>
        <label class="block" for="name">Name</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="mt-1 w-full appearance-none rounded-sm border border-gray-200 px-2 py-1 shadow-xs"
        />
      </div>

      <div class="flex gap-4">
        <button
          type="button"
          class="rounded-sm bg-slate-800 px-6 py-2 text-white"
          :disabled="form.processing"
          @click="form.post('/form/prevent-navigation-when-dirty')"
        >
          Submit
        </button>
        <Link href="/users" class="rounded-sm border border-gray-200 px-6 py-2 hover:bg-gray-50">Navigate away</Link>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-xl font-medium">&lt;Form&gt; component</h2>

      <Form action="/form/prevent-navigation-when-dirty" method="post" prevent-navigation-when-dirty>
        <template #default="{ isDirty, processing }">
          <p class="text-sm text-gray-600">
            Form component is
            <span v-if="isDirty" class="font-medium text-amber-700">dirty</span>
            <span v-else class="font-medium text-gray-500">clean</span>
          </p>

          <div v-if="isDirty" class="rounded-sm border border-amber-100 bg-amber-50 p-3 text-amber-800">
            There are unsaved changes!
          </div>

          <div>
            <label class="block" for="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value="initial"
              class="mt-1 w-full appearance-none rounded-sm border border-gray-200 px-2 py-1 shadow-xs"
            />
          </div>

          <div class="flex gap-4">
            <button type="submit" class="rounded-sm bg-slate-800 px-6 py-2 text-white" :disabled="processing">
              Submit
            </button>
            <Link href="/users" class="rounded-sm border border-gray-200 px-6 py-2 hover:bg-gray-50">
              Navigate away
            </Link>
          </div>
        </template>
      </Form>
    </section>

    <section class="rounded border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
      <h2 class="mb-2 font-medium">How to test</h2>
      <ol class="list-decimal space-y-1 pl-5">
        <li>Edit a field so the form becomes dirty.</li>
        <li>Click “Navigate away” — a browser confirmation should appear.</li>
        <li>Dismiss to stay on this page, or accept to go to Users.</li>
        <li>Submit while dirty — no confirmation should appear.</li>
        <li>Refresh or close the tab while dirty — a beforeunload warning should appear.</li>
      </ol>
    </section>
  </div>
</template>
