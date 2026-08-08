<template>
  <div class="expiry-row">
    <span class="led" :class="ledClass"></span>
    <div class="expiry-info">
      <span class="expiry-name">{{ ingredient.name }}</span>
      <span class="expiry-qty">{{ ingredient.quantity }} {{ ingredient.unit }}</span>
    </div>
    <div class="countdown" :class="countdownClass">
      <span class="cd-num">{{ days }}</span>
      <span class="cd-unit">DAYS</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ ingredient: Object })

const days = computed(() => Math.max(0, Math.ceil((new Date(props.ingredient.expiration_date) - Date.now()) / 86400000)))
const ledClass = computed(() => days.value <= 3 ? 'led-red' : days.value <= 7 ? 'led-yellow' : 'led-green')
const countdownClass = computed(() => days.value <= 3 ? 'cd-critical' : days.value <= 7 ? 'cd-warning' : 'cd-ok')
</script>

<style scoped>
.expiry-row { display: flex; align-items: center; gap: 10px; padding: 7px 12px; border-bottom: 1px solid var(--border-dim); }
.expiry-row:nth-child(even) { background: var(--row-alt); }
.expiry-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.expiry-name { color: var(--text-bright); font-weight: 600; font-size: 0.83rem; }
.expiry-qty  { color: var(--text-dim); font-size: 0.72rem; }
.led { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.led-green  { background: var(--green); }
.led-yellow { background: var(--yellow); }
.led-red    { background: var(--red); }
.countdown { display: flex; flex-direction: column; align-items: center; min-width: 38px; font-family: 'Special Elite', monospace; }
.cd-num  { font-size: 1.35rem; font-weight: 700; line-height: 1; }
.cd-unit { font-size: 0.52rem; letter-spacing: 1px; color: var(--text-faint); }
.cd-critical .cd-num { color: var(--red);    text-shadow: 0 0 8px rgba(200,48,32,0.6); }
.cd-warning  .cd-num { color: var(--yellow); }
.cd-ok       .cd-num { color: var(--green);  }
</style>
