<template>
  <div class="stock-bar" :class="canCook ? 'ok' : 'missing'">
    <span :style="{ color: canCook ? 'var(--green)' : 'var(--red)', fontWeight: 600, fontSize: '0.82rem' }">
      {{ canCook ? '✔ All ingredients in stock' : `✘ Missing ${missingCount} ingredient(s)` }}
    </span>
    <button class="btn btn-sm btn-green" @click="$emit('cook-clicked')" v-if="canCook">Log Cook</button>
  </div>
</template>

<script setup>
defineProps({ canCook: Boolean, missingCount: Number })
defineEmits(['cook-clicked'])
</script>

<style scoped>
.stock-bar { padding: 7px 12px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; border-bottom: 1px solid var(--border-dim); }
.stock-bar.ok { background: var(--green-bg); border-left: 2px solid var(--green-border); }
.stock-bar.missing { background: var(--red-bg); border-left: 2px solid var(--red-border); }
</style>
