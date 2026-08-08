<template>
  <router-link
    :to="`/recipes/${recipe.id}`"
    class="recipe-card label-card"
  >
    <div class="rc-top-bar" :class="recipe.canCook ? 'ok' : 'nok'"></div>
    <div class="rc-name">{{ recipe.name }}</div>
    <div class="rc-date">{{ recipe.lastCookedAt || 'Never cooked' }}</div>
    <div class="rc-status" :class="recipe.canCook ? 'ok' : 'nok'">
      {{ recipe.canCook ? '● Ready to cook' : `○ Missing ${recipe.missingCount}` }}
    </div>
  </router-link>
</template>

<script setup>
defineProps({ recipe: Object })
</script>

<style scoped>
.recipe-card { display: block; text-decoration: none; overflow: hidden; }
.rc-top-bar { height: 3px; }
.rc-top-bar.ok  { background: var(--green); }
.rc-top-bar.nok { background: var(--red); }
.rc-name { padding: 10px 10px 2px; font-family: 'Fraunces', serif; font-weight: 700; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rc-date { padding: 0 10px 4px; color: var(--text-faint); font-size: 0.67rem; }
.rc-status { padding: 4px 10px 10px; font-family: 'Special Elite', monospace; font-size: 0.67rem; letter-spacing: 0.5px; }
.rc-status.ok  { color: var(--green-on-label); }
.rc-status.nok { color: var(--red-on-label); }

@media (max-width: 767px) {
  .rc-name { font-size: 0.85rem; }
}
</style>
