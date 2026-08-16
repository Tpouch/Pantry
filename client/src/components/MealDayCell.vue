<template>
  <div class="day-cell">
    <div class="day-header" :class="{ today: isToday }">
      <span class="day-name">{{ day.name }}</span>
      <span class="day-date">{{ day.date }}</span>
    </div>
    <div class="day-meals">
      <MealSlot
        v-for="mealType in ['lunch', 'dinner']"
        :key="mealType"
        :mealType="mealType"
        :recipe="mealType === 'lunch' ? lunch : dinner"
        @select="$emit('open-picker', { dayIndex, mealType })"
      />
    </div>
  </div>
</template>

<script setup>
import MealSlot from './MealSlot.vue'

defineProps({ day: Object, dayIndex: Number, isToday: Boolean, lunch: Object, dinner: Object })
defineEmits(['open-picker'])
</script>

<style scoped>
.day-cell { background: var(--panel); border: 1px solid var(--border-dim); border-radius: 2px; overflow: hidden; }
.day-header { background: var(--header-mid); border-bottom: 1px solid var(--border-dim); padding: 8px 12px; display: flex; align-items: center; gap: 10px; }
.day-header.today { border-bottom-color: var(--green); }
.day-name { color: var(--text-bright); font-size: 1rem; font-weight: 700; text-transform: uppercase; }
.day-date { color: var(--text-faint); font-size: 0.85rem; }
.day-header.today .day-name { color: var(--green); }
.day-meals { padding: 10px; display: flex; flex-direction: row; gap: 10px; }

@media (max-width: 767px) {
  .day-header { padding: 6px 10px; }
  .day-name { font-size: 0.85rem; }
  .day-date { font-size: 0.75rem; }
  .day-meals { padding: 6px; gap: 6px; }
}
</style>
