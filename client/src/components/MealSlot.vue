<template>
  <div class="meal-slot">
    <div class="slot-label">{{ mealType }}</div>
    <template v-if="recipe">
      <div class="slot-filled label-card">
        <div class="slot-name">{{ recipe.name }}</div>
        <div class="slot-actions">
          <router-link :to="`/recipes/${recipe.id}`" class="btn btn-sm">View</router-link>
          <button class="btn btn-sm" @click="$emit('select')">Change</button>
        </div>
      </div>
    </template>
    <template v-else>
      <button class="slot-empty btn" @click="$emit('select')">+ Select</button>
    </template>
  </div>
</template>

<script setup>
defineProps({ mealType: String, recipe: Object })
defineEmits(['select'])
</script>

<style scoped>
.meal-slot { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.slot-label { font-family: 'Special Elite', monospace; font-size: 0.7rem; text-transform: uppercase; color: var(--text-faint); letter-spacing: 1px; }
.slot-empty { width: 100%; padding: 16px 8px; font-size: 0.9rem; font-style: italic; color: var(--text-muted); background: var(--panel-alt); border: 1px dashed var(--border-dim); cursor: pointer; border-radius: 2px; }
.slot-empty:hover { border-color: var(--border); color: var(--text); }
.slot-filled { padding: 10px; }
.slot-name { font-family: 'Fraunces', serif; color: var(--ink); font-size: 0.95rem; font-weight: 700; margin-bottom: 8px; line-height: 1.4; }
.slot-actions { display: flex; gap: 6px; }
.slot-actions :deep(.btn) { font-size: 0.8rem; padding: 4px 10px; }

@media (max-width: 767px) {
  .slot-label { font-size: 0.7rem; }
  .slot-empty { padding: 10px 6px; font-size: 0.8rem; }
  .slot-name { font-size: 0.85rem; }
  .slot-actions :deep(.btn) { font-size: 0.72rem; padding: 3px 7px; }
}
</style>
