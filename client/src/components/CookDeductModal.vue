<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="panel-title">Log Cook — Deduct Ingredients</div>
      <div class="modal-note">Adjust quantities actually used. Click USE ALL to use the full required amount.</div>
      <div class="modal-scroll">
        <div class="deduct-row" v-for="ing in deductions" :key="ing.ingredient_id">
          <div class="deduct-name">{{ ing.ingredient_name }}</div>
          <div class="deduct-controls">
            <span class="deduct-label">Used:</span>
            <input v-model.number="ing.used" type="number" class="qty-input" min="0" :max="ing.stock_quantity" />
            <span class="qty-unit">{{ ing.unit }}</span>
            <button class="use-all" @click="ing.used = ing.quantity">USE ALL</button>
          </div>
          <div class="deduct-stock">In stock: {{ ing.stock_quantity }} {{ ing.stock_unit }}</div>
        </div>
        <div v-if="!deductions.length" style="padding:16px;color:var(--text-muted)">No linked ingredients.</div>
      </div>
      <div class="modal-footer">
        <button class="btn" @click="$emit('close')">Cancel</button>
        <button class="btn btn-green" @click="confirm">✔ Confirm & Deduct</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../api'

const props = defineProps({ recipe: Object })
const emit = defineEmits(['close', 'logged'])

const deductions = ref(
  (props.recipe.ingredients || []).map(ing => ({
    ingredient_id: ing.ingredient_id,
    ingredient_name: ing.ingredient_name,
    quantity: ing.quantity,
    unit: ing.unit,
    stock_quantity: ing.stock_quantity,
    stock_unit: ing.stock_unit,
    used: ing.quantity
  }))
)

async function confirm() {
  const today = new Date().toISOString().slice(0, 10)
  await api.cookLog.create({
    recipeId: props.recipe.id,
    cookedAt: today,
    deductions: deductions.value
      .filter(d => d.used > 0)
      .map(d => ({ ingredientId: d.ingredient_id, quantityUsed: d.used }))
  })
  emit('logged')
}
</script>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.82); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal { background: var(--panel); border: 1px solid var(--border-dim); box-shadow: var(--bevel-hi), var(--bevel-lo), 0 8px 32px rgba(0,0,0,0.8); width: 400px; max-height: 80vh; display: flex; flex-direction: column; }
.modal-note { padding: 8px 14px; background: var(--panel-alt); border-bottom: 1px solid var(--border-dim); color: var(--text-dim); font-size: 0.78rem; }
.modal-scroll { overflow-y: auto; flex: 1; }
.deduct-row { padding: 10px 14px; border-bottom: 1px solid var(--border-dim); }
.deduct-row:nth-child(even) { background: var(--row-alt); }
.deduct-name { color: var(--text-bright); font-weight: 600; font-size: 0.88rem; margin-bottom: 6px; }
.deduct-controls { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }
.deduct-label { color: var(--text-dim); font-size: 0.78rem; }
.qty-input { background: var(--bg-mid); border: 1px solid var(--border-dim); box-shadow: inset 1px 1px 0 rgba(0,0,0,0.4); color: var(--text); font-family: inherit; font-size: 0.88rem; padding: 5px 8px; width: 76px; }
.qty-unit { color: var(--text-dim); font-size: 0.78rem; }
.use-all { margin-left: auto; background: var(--panel-alt); border: 1px solid var(--border-dim); box-shadow: var(--bevel-hi), var(--bevel-lo); color: var(--text-dim); font-family: inherit; font-size: 0.68rem; text-transform: uppercase; padding: 3px 8px; cursor: pointer; }
.use-all:hover { background: var(--row-hover); color: var(--text); border-color: var(--border); }
.deduct-stock { color: var(--text-faint); font-size: 0.72rem; }
.modal-footer { padding: 10px 14px; background: var(--header-mid); border-top: 1px solid var(--border-dim); display: flex; gap: 6px; justify-content: flex-end; }

@media (max-width: 767px) {
  .modal { width: calc(100vw - 16px); max-height: 88vh; }
  .deduct-controls { flex-wrap: wrap; gap: 6px; }
  .qty-input { width: 80px; }
  .use-all { margin-left: 0; }
}
</style>
