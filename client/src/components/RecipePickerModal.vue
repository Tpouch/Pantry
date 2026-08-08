<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="panel-title">Select a Recipe</div>
      <div class="modal-body">
        <input v-model="search" class="input" placeholder="Search recipes..." autofocus />
        <div class="picker-list">
          <div
            v-for="r in filtered"
            :key="r.id"
            class="picker-row"
            @click="$emit('select', r)"
          >
            <span class="picker-name">{{ r.name }}</span>
            <StockBadge :canCook="r.canCook" :missingCount="r.missingCount" />
          </div>
          <div v-if="!filtered.length" class="picker-empty">No recipes found.</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" @click="$emit('close')">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../api'
import StockBadge from './StockBadge.vue'

defineEmits(['close', 'select'])

const recipes = ref([])
const search = ref('')

const filtered = computed(() =>
  recipes.value.filter(r => r.name.toLowerCase().includes(search.value.toLowerCase()))
)

onMounted(async () => {
  recipes.value = await api.recipes.list()
})
</script>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.82); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal { background: var(--panel); border: 1px solid var(--border-dim); box-shadow: var(--bevel-hi), var(--bevel-lo), 0 8px 32px rgba(0,0,0,0.8); width: 400px; max-height: 80vh; display: flex; flex-direction: column; }
.modal-body { overflow-y: auto; flex: 1; padding: 12px 14px; }
.input { background: var(--bg-mid); border: 1px solid var(--border-dim); box-shadow: inset 1px 1px 0 rgba(0,0,0,0.4); color: var(--text); font-family: inherit; font-size: 0.88rem; padding: 8px 10px; width: 100%; }
.input::placeholder { color: var(--text-faint); }
.input:focus { outline: none; border-color: var(--border); }
.picker-list { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
.picker-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: var(--panel-alt); border: 1px solid var(--border-dim); border-radius: 2px; cursor: pointer; }
.picker-row:hover { background: var(--panel-alt); border-color: var(--border); }
.picker-name { color: var(--text-bright); font-size: 0.88rem; }
.picker-empty { color: var(--text-muted); font-size: 0.85rem; padding: 8px 0; }
.modal-footer { padding: 10px 14px; background: var(--header-mid); border-top: 1px solid var(--border-dim); display: flex; gap: 6px; justify-content: flex-end; }

@media (max-width: 767px) {
  .modal { width: calc(100vw - 16px); max-height: 88vh; }
}
</style>
