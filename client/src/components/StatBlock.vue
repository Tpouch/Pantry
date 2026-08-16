<template>
  <div class="stat-block label-card">
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value" :style="{ color: color || 'var(--ink)' }">{{ value }}</div>
    <div class="stat-track" v-if="bar != null">
      <div class="stat-fill" :style="{ width: Math.max(2, bar) + '%', background: barColor }"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [Number, String],
  color: String,
  bar: { type: Number, default: null },
  barColor: String
})
</script>

<style scoped>
.stat-block { flex: 1; padding: 12px 14px; margin: 0 6px; }
.stat-label { font-family: 'Special Elite', monospace; color: var(--text-faint-on-label); font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
.stat-value { font-family: 'Fraunces', serif; font-size: 1.7rem; font-weight: 700; line-height: 1; margin-bottom: 7px; }
.stat-track { height: 3px; background: var(--label-tab); }
.stat-fill { height: 100%; transition: width 0.6s ease; }

@media (max-width: 767px) {
  .stat-block { flex: 1 1 40%; margin: 4px; }
  .stat-value { font-size: 1.35rem; }
}

@media (prefers-reduced-motion: reduce) {
  .stat-fill { transition: none; }
}
</style>
