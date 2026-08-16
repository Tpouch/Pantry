<template>
  <div class="page">
    <PageHeader title="Cook Log">
      <span style="color:var(--text-faint);font-size:0.78rem">{{ entries.length }} entries</span>
    </PageHeader>
    <div class="panel log-list">
      <div class="trow header-row">
        <div style="flex:3">Recipe</div>
        <div style="flex:1">Date</div>
        <div style="flex:0 0 60px"></div>
      </div>
      <div class="trow" v-for="entry in entries" :key="entry.id" style="cursor:default">
        <div style="flex:3">
          <router-link :to="`/recipes/${entry.recipe_id}`" class="recipe-link">{{ entry.recipe_name }}</router-link>
        </div>
        <div style="flex:1" class="log-date">{{ entry.cooked_at }}</div>
        <div style="flex:0 0 60px">
          <button class="btn btn-sm btn-danger" @click="confirmDelete(entry)">✕</button>
        </div>
      </div>
      <div class="trow" v-if="!entries.length" style="color:var(--text-muted)">No cooks logged yet.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'
import PageHeader from '../components/PageHeader.vue'

const entries = ref([])
onMounted(load)
async function load() { entries.value = await api.cookLog.list() }

async function confirmDelete(entry) {
  if (!confirm(`Delete cook log entry for "${entry.recipe_name}" on ${entry.cooked_at}?`)) return
  await api.cookLog.remove(entry.id)
  await load()
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; height: 100%; padding: 10px; }
.log-list { flex: 1; overflow-y: auto; }
.header-row { background: var(--panel-alt); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-faint); cursor: default !important; }
.recipe-link { color: var(--text-bright); text-decoration: none; font-weight: 600; }
.recipe-link:hover { color: var(--accent); }
.log-date { font-family: 'Special Elite', monospace; font-size: 0.8rem; color: var(--text-dim); }

@media (max-width: 767px) {
  .header-row { display: none; }
  .trow { min-height: 44px; flex-wrap: wrap; gap: 4px; }
}
</style>
