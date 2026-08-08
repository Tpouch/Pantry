<template>
  <div class="masthead">
    <div class="masthead-left">
      <div class="masthead-title">The Larder</div>
      <div class="masthead-date">{{ todayStr }}</div>
    </div>
    <div class="masthead-right" v-if="summary">
      <div class="status-line" :class="systemStatus.cls">{{ systemStatus.label }}</div>
      <div class="masthead-summary">
        {{ summary.totalIngredients }} ingredients &bull; {{ summary.totalRecipes }} recipes &bull; {{ summary.totalCooks }} cooks
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ todayStr: String, systemStatus: Object, summary: Object })
</script>

<style scoped>
.masthead {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; background: var(--panel); border: 1px solid var(--border-dim);
  box-shadow: var(--bevel-hi), var(--bevel-lo);
}
.masthead-title { font-family: 'Fraunces', serif; font-size: 1.3rem; font-weight: 700; color: var(--text-bright); }
.masthead-date { font-family: 'Special Elite', monospace; font-size: 0.65rem; color: var(--text-faint); letter-spacing: 1px; margin-top: 3px; }
.masthead-right { text-align: right; }
.masthead-summary { font-family: 'Special Elite', monospace; font-size: 0.65rem; color: var(--text-faint); letter-spacing: 0.5px; margin-top: 4px; }
.status-line { font-family: 'Karla', sans-serif; font-size: 0.85rem; font-weight: 700; }
.status-line.nominal  { color: var(--green); }
.status-line.warning  { color: var(--yellow); }
.status-line.critical { color: var(--red); }
.status-line.offline  { color: var(--text-faint); }

@media (max-width: 767px) {
  .masthead { flex-direction: column; align-items: flex-start; gap: 6px; padding: 12px 14px; }
  .masthead-right { text-align: left; }
  .masthead-title { font-size: 1.1rem; }
}
</style>
