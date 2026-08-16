<template>
  <div class="detail-layout" v-if="recipe">
    <!-- LEFT PANEL -->
    <div class="panel left-panel">
      <div class="panel-title">
        Recipe Info
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm" @click="showEdit = true">✎ Edit</button>
          <button class="btn btn-sm btn-green" @click="showCook = true">Log Cook</button>
        </div>
      </div>
      <div class="photo-area">
        <div class="photo-corner"></div>
        <div class="photo-caption">No photo yet</div>
      </div>
      <div class="panel-scroll">
        <div class="meta-section">
          <div class="recipe-name">{{ recipe.name }}</div>
          <div class="recipe-meta">
            <span>Prep: <b>{{ recipe.prep_time ? recipe.prep_time + ' min' : '—' }}</b></span>
            <span>Cook: <b>{{ recipe.cook_time ? recipe.cook_time + ' min' : '—' }}</b></span>
            <span>Serves: <b>{{ recipe.servings || '—' }}</b></span>
          </div>
        </div>
        <RecipeStockBar :canCook="recipe.canCook" :missingCount="missingCount" @cook-clicked="showCook = true" />
        <div class="section-label">Ingredients</div>
        <div class="trow" v-for="ing in recipe.ingredients" :key="ing.id">
          <div>
            <div class="trow-name">{{ ing.ingredient_name }}</div>
            <div class="trow-meta">needs {{ ing.quantity }} {{ ing.unit }}</div>
          </div>
          <div :style="{ color: ing.hasEnough ? 'var(--green)' : 'var(--red)', fontWeight: 600, fontSize: '0.82rem' }">
            {{ ing.hasEnough ? '✔' : '✘' }} {{ ing.stock_quantity }} {{ ing.stock_unit }}
          </div>
        </div>
        <div class="trow" v-if="!recipe.ingredients.length" style="color:var(--text-muted)">No ingredients linked.</div>
        <div v-if="recipe.notes">
          <div class="section-label">Notes</div>
          <div style="padding:10px 12px;color:var(--text-dim);font-size:0.85rem;line-height:1.5">{{ recipe.notes }}</div>
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL -->
    <div class="panel right-panel">
      <div class="panel-title">
        Steps
        <span style="color:var(--text-faint);font-size:0.75rem">{{ recipe.steps.length }} step{{ recipe.steps.length !== 1 ? 's' : '' }}</span>
      </div>
      <div style="flex:1;overflow-y:auto">
        <StepList :steps="recipe.steps" />
        <div v-if="!recipe.steps.length" style="padding:16px;color:var(--text-muted)">No steps defined. Edit the recipe to add steps.</div>
      </div>
    </div>

    <CookDeductModal v-if="showCook" :recipe="recipe" @close="showCook = false" @logged="onLogged" />
    <RecipeEditModal v-if="showEdit" :recipe="recipe" @close="showEdit = false" @saved="onSaved" />
  </div>
  <div v-else style="padding:2rem;color:var(--text-muted)">Loading...</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api'
import StepList from '../components/StepList.vue'
import CookDeductModal from '../components/CookDeductModal.vue'
import RecipeStockBar from '../components/RecipeStockBar.vue'
import RecipeEditModal from '../components/RecipeEditModal.vue'

const route = useRoute()
const recipe = ref(null)
const showCook = ref(false)
const showEdit = ref(false)

const missingCount = computed(() => recipe.value?.ingredients.filter(i => !i.hasEnough).length ?? 0)

onMounted(load)

async function load() {
  recipe.value = await api.recipes.get(Number(route.params.id))
}

async function onLogged() {
  showCook.value = false
  await load()
}

async function onSaved() {
  showEdit.value = false
  await load()
}
</script>

<style scoped>
.detail-layout { display: flex; gap: 8px; padding: 10px; height: 100%; }
.left-panel { width: 310px; flex-shrink: 0; display: flex; flex-direction: column; overflow: hidden; }
.right-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.panel-scroll { overflow-y: auto; flex: 1; }
.photo-area {
  height: 130px; background: var(--panel-alt); border-bottom: 1px dashed var(--border-dim);
  flex-shrink: 0; display: flex; align-items: center; justify-content: center; flex-direction: column;
  position: relative;
}
.photo-corner {
  position: absolute; top: 0; right: 0;
  width: 0; height: 0;
  border-style: solid;
  border-width: 0 22px 22px 0;
  border-color: transparent var(--bg) transparent transparent;
}
.photo-caption {
  font-family: 'Special Elite', monospace;
  color: var(--text-faint); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px;
}
.meta-section { padding: 10px 12px; border-bottom: 1px solid var(--border-dim); }
.recipe-name { font-size: 1.1rem; font-weight: 700; color: var(--text-bright); margin-bottom: 6px; font-family: 'Fraunces', serif; }
.recipe-meta { display: flex; gap: 14px; flex-wrap: wrap; color: var(--text-dim); font-size: 0.78rem; }
.recipe-meta b { color: var(--text); }

@media (max-width: 767px) {
  .detail-layout { flex-direction: column; overflow-y: auto; overflow-x: hidden; height: 100%; padding: 6px; gap: 6px; }
  .left-panel { width: 100% !important; flex-shrink: 0; overflow: visible; height: auto; }
  .panel-scroll { overflow: visible; flex: none; height: auto; }
  .photo-area { height: 80px; }
  .right-panel { flex: none; height: auto; overflow: visible; min-height: 200px; }
  .right-panel > div { overflow: visible; height: auto; }
}
</style>
