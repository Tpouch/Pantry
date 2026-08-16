<template>
  <div class="step-list">
    <div class="progress-wrap">
      <div class="progress-label">
        <span>Progress</span>
        <span>{{ completedMain }} / {{ steps.length }}</span>
      </div>
      <div class="progress-track">
        <div class="progress-seg" v-for="(_, i) in steps" :key="i" :class="{ filled: i < completedMain }"></div>
      </div>
    </div>

    <div class="step-item" v-for="(step, si) in localSteps" :key="si"
      :class="{ active: isActiveStep(si), done: step.checked }">
      <div class="step-main">
        <div class="step-check" :class="{ checked: step.checked }" @click="toggleStep(si)"></div>
        <div class="step-num">{{ si + 1 }}.</div>
        <div class="step-text" :class="{ done: step.checked }">{{ step.text }}</div>
        <div v-if="step.substeps && step.substeps.length" class="step-expand" @click="toggleExpand(si)">
          {{ step.expanded ? '▲' : '▼' }} {{ step.substeps.length }} sub
        </div>
      </div>
      <div class="substeps" v-if="step.expanded && step.substeps && step.substeps.length">
        <div class="substep" v-for="(sub, subi) in step.substeps" :key="subi">
          <div class="substep-check" :class="{ checked: step.subChecked[subi] }" @click="toggleSub(si, subi)"></div>
          <div class="substep-text" :class="{ done: step.subChecked[subi] }">{{ sub }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({ steps: { type: Array, default: () => [] } })
const localSteps = ref([])

watch(() => props.steps, (newSteps) => {
  localSteps.value = newSteps.map(s => ({
    ...s, checked: false, expanded: true,
    subChecked: (s.substeps || []).map(() => false)
  }))
}, { immediate: true })

const completedMain = computed(() => localSteps.value.filter(s => s.checked).length)

function isActiveStep(si) {
  if (localSteps.value[si].checked) return false
  for (let i = 0; i < si; i++) { if (!localSteps.value[i].checked) return false }
  return true
}

function toggleStep(si) { localSteps.value[si].checked = !localSteps.value[si].checked }
function toggleSub(si, subi) { localSteps.value[si].subChecked[subi] = !localSteps.value[si].subChecked[subi] }
function toggleExpand(si) { localSteps.value[si].expanded = !localSteps.value[si].expanded }
</script>

<style scoped>
.step-list { display: flex; flex-direction: column; }
.progress-wrap { padding: 8px 12px; background: var(--panel-alt); border-bottom: 1px solid var(--border-dim); flex-shrink: 0; }
.progress-label { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.72rem; color: var(--text-dim); }
.progress-track { height: 7px; background: var(--bg-mid); border: 1px solid var(--border-dim); display: flex; gap: 2px; padding: 1px; }
.progress-seg { flex: 1; background: transparent; }
.progress-seg.filled { background: var(--accent); }

.step-item { border-bottom: 1px solid var(--border-dim); }
.step-item:nth-child(even) { background: var(--row-alt); }
.step-item.active { background: var(--panel-alt); border-left: 2px solid var(--accent); }
.step-main { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; }

.step-check {
  width: 18px; height: 18px; border: 1px solid var(--border);
  background: var(--bg-mid); box-shadow: inset 1px 1px 0 rgba(0,0,0,0.4);
  flex-shrink: 0; margin-top: 2px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.step-check.checked { background: var(--green-bg); border-color: var(--green-border); }
.step-check.checked::after { content: '✔'; color: var(--green); font-size: 0.65rem; }

.step-num { color: var(--text-dim); font-size: 0.82rem; min-width: 22px; margin-top: 1px; }
.step-text { color: var(--text); font-size: 0.88rem; line-height: 1.5; flex: 1; }
.step-text.done { color: var(--text-faint); text-decoration: line-through; }
.step-expand { color: var(--text-faint); font-size: 0.68rem; margin-left: auto; flex-shrink: 0; cursor: pointer; white-space: nowrap; }
.step-expand:hover { color: var(--text-dim); }

.substeps { padding: 0 12px 10px 50px; display: flex; flex-direction: column; gap: 6px; }
.substep { display: flex; align-items: flex-start; gap: 8px; }
.substep-check {
  width: 14px; height: 14px; border: 1px solid var(--border-dim);
  background: var(--bg-mid); flex-shrink: 0; margin-top: 2px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.substep-check.checked { background: var(--green-bg); border-color: var(--green-border); }
.substep-check.checked::after { content: '✔'; color: var(--green); font-size: 0.55rem; }
.substep-text { color: var(--text-dim); font-size: 0.8rem; line-height: 1.5; }
.substep-text.done { color: var(--text-faint); text-decoration: line-through; }
</style>
