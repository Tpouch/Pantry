<template>
  <div class="steps-edit-list">
    <div class="step-edit-block" v-for="(step, si) in items" :key="si">
      <div class="step-edit-row">
        <span style="color:var(--text-dim);font-size:0.82rem;min-width:22px">{{ si + 1 }}.</span>
        <input v-model="step.text" class="input" placeholder="Step description" style="flex:1" @input="emitUpdate" />
        <button class="btn btn-sm btn-danger" @click="removeStep(si)">✕</button>
      </div>
      <div class="substep-edit-list">
        <div class="substep-edit-row" v-for="(sub, subi) in step.substeps" :key="subi">
          <span style="color:var(--text-faint);padding:0 8px;font-size:0.82rem">↳</span>
          <input v-model="step.substeps[subi]" class="input" placeholder="Sub-step" style="flex:1" @input="emitUpdate" />
          <button class="btn btn-sm btn-danger" @click="removeSubstep(step, subi)">✕</button>
        </div>
        <button class="btn btn-sm" style="margin-left:28px;margin-top:4px" @click="addSubstep(step)">+ Sub-step</button>
      </div>
    </div>
    <button class="btn btn-sm" @click="addStep">+ Add Step</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ modelValue: Array })
const emit = defineEmits(['update:modelValue'])

const items = ref((props.modelValue || []).map(s => ({ text: s.text, substeps: [...(s.substeps || [])] })))

function emitUpdate() {
  emit('update:modelValue', items.value)
}

function removeStep(si) {
  items.value.splice(si, 1)
  emitUpdate()
}

function addStep() {
  items.value.push({ text: '', substeps: [] })
  emitUpdate()
}

function removeSubstep(step, subi) {
  step.substeps.splice(subi, 1)
  emitUpdate()
}

function addSubstep(step) {
  step.substeps.push('')
  emitUpdate()
}
</script>

<style scoped>
.input { background: var(--bg-mid); border: 1px solid var(--border-dim); box-shadow: inset 1px 1px 0 rgba(0,0,0,0.3); color: var(--text); font-family: inherit; font-size: 0.88rem; padding: 7px 10px; width: 100%; }
.steps-edit-list { display: flex; flex-direction: column; gap: 8px; }
.step-edit-block { background: var(--bg-mid); border: 1px solid var(--border-dim); padding: 8px; }
.step-edit-row { display: flex; gap: 6px; align-items: center; margin-bottom: 5px; }
.substep-edit-list { display: flex; flex-direction: column; gap: 4px; }
.substep-edit-row { display: flex; gap: 4px; align-items: center; }
</style>
