<template>
  <div class="page">
    <PageHeader title="Ingredients">
      <button class="btn btn-sm btn-green" @click="openAdd">+ Add Ingredient</button>
    </PageHeader>

    <div class="tab-switch">
      <button class="btn btn-sm" :class="{ 'btn-active': activeTab === 'mine' }" @click="activeTab = 'mine'">My Ingredients</button>
      <button class="btn btn-sm" :class="{ 'btn-active': activeTab === 'shopping' }" @click="activeTab = 'shopping'">Shopping List</button>
    </div>

    <div class="panel ing-list" v-if="activeTab === 'mine'">
      <div class="trow header-row">
        <div class="col-name" style="flex:2">Name</div>
        <div class="col-qty" style="flex:1">Quantity</div>
        <div class="col-cat" style="flex:1">Category</div>
        <div class="col-exp" style="flex:1">Expires</div>
        <div class="col-actions" style="flex:0 0 80px">Actions</div>
      </div>
      <IngredientRow
        v-for="ing in myIngredients"
        :key="ing.id"
        :ingredient="ing"
        @edit="openEdit"
        @delete="confirmDelete"
      />
      <div class="trow" v-if="!myIngredients.length && !hiddenIngredients.length" style="color:var(--text-muted)">No ingredients yet. Add some!</div>
      <div class="trow hidden-note" v-if="hiddenIngredients.length">
        {{ hiddenIngredients.length }} ingredient{{ hiddenIngredients.length !== 1 ? 's' : '' }} hidden because you have none in stock ({{ hiddenIngredients.map(i => i.name).join(', ') }}) — see Shopping List.
      </div>
    </div>

    <div class="panel ing-list" v-else>
      <div class="trow header-row">
        <div style="flex:2">Name</div>
        <div style="flex:1.6">Needed / Have</div>
        <div style="flex:1.6"></div>
      </div>
      <NeededIngredientRow
        v-for="ing in needed"
        :key="ing.id"
        :ingredient="ing"
        @add-stock="onAddStock"
      />
      <div class="trow" v-if="!needed.length" style="color:var(--text-muted)">Nothing needed yet — add ingredients to a recipe and they'll show up here.</div>
    </div>

    <IngredientFormModal
      v-if="showForm"
      :editing="editing"
      @close="showForm = false"
      @saved="onSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../api'
import PageHeader from '../components/PageHeader.vue'
import IngredientRow from '../components/IngredientRow.vue'
import NeededIngredientRow from '../components/NeededIngredientRow.vue'
import IngredientFormModal from '../components/IngredientFormModal.vue'

const ingredients = ref([])
const needed = ref([])
const activeTab = ref('mine')
const showForm = ref(false)
const editing = ref(null)

onMounted(load)

async function load() {
  const [ingredientsList, neededList] = await Promise.all([api.ingredients.list(), api.ingredients.needed()])
  ingredients.value = ingredientsList
  needed.value = neededList
}

const neededIds = computed(() => new Set(needed.value.map(n => n.id)))
const myIngredients = computed(() => ingredients.value.filter(i => i.quantity > 0 || !neededIds.value.has(i.id)))
const hiddenIngredients = computed(() => ingredients.value.filter(i => i.quantity <= 0 && neededIds.value.has(i.id)))

function openAdd() {
  editing.value = null
  showForm.value = true
}

function openEdit(ing) {
  editing.value = ing
  showForm.value = true
}

function onSaved() {
  showForm.value = false
  load()
}

async function confirmDelete(ing) {
  if (!confirm(`Delete "${ing.name}"?`)) return
  await api.ingredients.remove(ing.id)
  await load()
}

async function onAddStock({ id, amount }) {
  const ing = ingredients.value.find(i => i.id === id)
  if (!ing) return
  await api.ingredients.update(id, {
    name: ing.name,
    quantity: ing.quantity + amount,
    unit: ing.unit,
    expiration_date: ing.expiration_date,
    category: ing.category
  })
  await load()
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; height: 100%; padding: 10px; gap: 8px; }
.tab-switch { display: flex; gap: 4px; }
.ing-list { flex: 1; overflow-y: auto; }
.header-row { background: var(--panel-alt); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-faint); cursor: default !important; }
.hidden-note { color: var(--text-faint); font-size: 0.76rem; cursor: default !important; }

@media (max-width: 767px) {
  .header-row { display: none; }
  .col-cat, .col-exp { display: none !important; }
  .col-actions { flex: 0 0 72px !important; }
  .trow { min-height: 44px; }
}
</style>
