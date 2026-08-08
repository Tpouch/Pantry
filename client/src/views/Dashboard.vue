<template>
  <div class="dashboard">
    <DashboardHudHeader :todayStr="todayStr" :systemStatus="systemStatus" :summary="data?.stats" />

    <div class="stat-row" v-if="data">
      <StatBlock v-for="s in stats" :key="s.label" v-bind="s" />
    </div>

    <div class="row-2" v-if="data">
      <div class="panel">
        <div class="panel-title">
          ▲ EXPIRING SOON
          <span class="badge" :class="data.expiringIngredients.length ? 'badge-red' : 'badge-green'">
            {{ data.expiringIngredients.length }}
          </span>
        </div>
        <div class="trow" v-if="!data.expiringIngredients.length" style="color:var(--green);gap:8px">
          <span>✓</span><span>All clear — nothing expiring soon</span>
        </div>
        <ExpiryRow v-for="i in data.expiringIngredients" :key="i.id" :ingredient="i" />
      </div>

      <div class="panel">
        <div class="panel-title">RECENT INTAKE</div>
        <div class="trow" v-for="i in data.recentIngredients" :key="i.id">
          <div>
            <div class="trow-name">{{ i.name }}</div>
            <div class="trow-meta">{{ i.quantity }} {{ i.unit }} — {{ timeAgo(i.created_at) }}</div>
          </div>
          <span class="badge badge-grey">{{ i.category || '—' }}</span>
        </div>
        <div class="trow" v-if="!data.recentIngredients.length" style="color:var(--text-muted)">No ingredients yet.</div>
      </div>
    </div>

    <div class="panel" v-if="data">
      <div class="panel-title">
        RECIPE READINESS
        <span class="panel-note">{{ readyCount }}/{{ data.recentRecipes.length }} READY</span>
      </div>
      <div class="recipes-grid">
        <RecipeCard v-for="r in data.recentRecipes" :key="r.id" :recipe="r" />
        <div v-if="!data.recentRecipes.length" style="color:var(--text-muted);padding:12px;grid-column:1/-1">No recipes yet.</div>
      </div>
    </div>

    <div v-if="!data" class="loading-state">Loading…</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../api'
import DashboardHudHeader from '../components/DashboardHudHeader.vue'
import StatBlock from '../components/StatBlock.vue'
import ExpiryRow from '../components/ExpiryRow.vue'
import RecipeCard from '../components/RecipeCard.vue'

const data = ref(null)
onMounted(async () => { data.value = await api.dashboard.get() })

const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()

const readyCount = computed(() => {
  if (!data.value) return 0
  return data.value.recentRecipes.filter(r => r.canCook).length
})

function daysUntil(dateStr) {
  return Math.max(0, Math.ceil((new Date(dateStr) - Date.now()) / 86400000))
}

const systemStatus = computed(() => {
  if (!data.value) return { label: 'Offline', cls: 'offline' }
  const hasCritical = data.value.expiringIngredients.some(i => daysUntil(i.expiration_date) <= 3)
  const hasWarning = data.value.expiringIngredients.some(i => daysUntil(i.expiration_date) <= 7)
  const expiringCount = data.value.expiringIngredients.length
  if (hasCritical) return { label: `${expiringCount} expiring soon`, cls: 'critical' }
  if (hasWarning) return { label: `${expiringCount} expiring soon`, cls: 'warning' }
  return { label: 'Well stocked', cls: 'nominal' }
})

const stats = computed(() => {
  if (!data.value) return []
  const s = data.value.stats
  const pctExpiring = s.totalIngredients > 0 ? (s.expiringCount / s.totalIngredients) * 100 : 0
  const pctReady = s.totalRecipes > 0 ? (s.readyCount / s.totalRecipes) * 100 : 0
  return [
    { label: 'Ingredients', value: s.totalIngredients },
    { label: 'Expiring', value: s.expiringCount, color: s.expiringCount > 0 ? 'var(--red-on-label)' : 'var(--green-on-label)', bar: pctExpiring, barColor: 'var(--red)' },
    { label: 'Recipes', value: s.totalRecipes },
    { label: 'Ready to Cook', value: s.readyCount, color: s.readyCount > 0 ? 'var(--green-on-label)' : 'var(--ink)', bar: pctReady, barColor: 'var(--green)' },
    { label: 'Total Cooks', value: s.totalCooks },
  ]
})

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (diff === 0) return 'today'
  if (diff === 1) return '1 day ago'
  return `${diff} days ago`
}
</script>

<style scoped>
.dashboard { padding: 10px; display: flex; flex-direction: column; gap: 8px; height: 100%; overflow-y: auto; }
.stat-row { display: flex; margin: 0 -6px; }
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.panel-note { font-family: 'Share Tech Mono', monospace; font-size: 0.68rem; color: var(--text-faint); letter-spacing: 1px; }
.recipes-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; background: var(--border-dim); padding: 1px; }
.loading-state { padding: 2rem; color: var(--text-faint); font-family: 'Special Elite', monospace; font-size: 0.85rem; }

@media (max-width: 767px) {
  .stat-row { flex-wrap: wrap; }
  .row-2 { grid-template-columns: 1fr; }
  .recipes-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
