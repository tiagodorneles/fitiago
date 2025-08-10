<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Router View for other pages -->
    <main class="min-h-screen">
      <RouterView />
    </main>
  </div>
</template>
