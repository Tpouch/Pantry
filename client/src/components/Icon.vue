<template>
  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path :d="paths[name]" />
  </svg>
</template>

<script setup>
defineProps({ name: { type: String, required: true } })

const paths = {
  home: 'M4 11 12 4l8 7M6 10v9h12v-9',
  jar: 'M9 3v4M15 3v4M6 7h12l-1 13H7L6 7Z',
  book: 'M5 4h11l3 3v13H5V4Z M16 4v3h3',
  ribbon: 'M6 3h12v18l-6-3-6 3V3Z',
  calendar: 'M4 5h16v15H4V5Z M4 9h16 M8 3v4 M16 3v4'
}
</script>

<style scoped>
.icon { width: 1em; height: 1em; display: inline-block; vertical-align: middle; }
</style>
