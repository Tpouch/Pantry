<template>
  <div class="trow need-row">
    <div class="need-name">
      <span class="trow-name">{{ ingredient.name }}</span>
    </div>
    <div class="need-qty">
      need <b>{{ ingredient.needed }} {{ ingredient.unit }}</b> — have <b>{{ ingredient.quantity }} {{ ingredient.unit }}</b>
    </div>
    <div class="need-action">
      <template v-if="ingredient.missing > 0">
        <input
          type="number"
          class="need-input"
          min="0"
          step="any"
          v-model.number="amount"
        />
        <button class="btn btn-sm btn-green" @click="onAddStock">Add to stock</button>
      </template>
      <span v-else class="badge badge-green">✔ in stock</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ ingredient: Object })
const emit = defineEmits(['add-stock'])

const amount = ref(props.ingredient.missing)

watch(() => props.ingredient.missing, (v) => { amount.value = v })

function onAddStock() {
  if (!amount.value || amount.value <= 0) return
  emit('add-stock', { id: props.ingredient.id, amount: amount.value })
}
</script>

<style scoped>
.need-row { gap: 14px; }
.need-name { flex: 2; }
.need-qty { flex: 1.6; font-family: 'Special Elite', monospace; font-size: 0.78rem; color: var(--text-dim); }
.need-qty b { color: var(--text-bright); font-family: inherit; }
.need-action { flex: 1.6; display: flex; gap: 6px; align-items: center; justify-content: flex-end; }
.need-input { width: 70px; background: var(--bg-mid); border: 1px solid var(--border-dim); box-shadow: inset 1px 1px 0 rgba(0,0,0,0.3); color: var(--text); font-family: inherit; font-size: 0.85rem; padding: 5px 8px; }

@media (max-width: 767px) {
  .need-row { flex-wrap: wrap; }
  .need-qty { flex: 1 1 100%; order: 3; }
}
</style>
