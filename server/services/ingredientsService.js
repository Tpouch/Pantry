const repo = require('../repositories/ingredientsRepository')

function listIngredients() {
  return repo.findAll()
}

function getExpiringSoon() {
  return repo.findExpiringSoon(14)
}

function getRecent(limit = 5) {
  return repo.findRecent(limit)
}

function getNeededIngredients() {
  const rows = repo.findNeeded()
  const withMissing = rows.map(r => ({ ...r, missing: Math.max(0, r.needed - r.quantity) }))
  withMissing.sort((a, b) => {
    const aShort = a.missing > 0 ? 0 : 1
    const bShort = b.missing > 0 ? 0 : 1
    if (aShort !== bShort) return aShort - bShort
    return a.name.localeCompare(b.name)
  })
  return withMissing
}

function createIngredient(data) {
  if (!data.name || data.name.trim() === '') throw new Error('Name is required')
  if (data.quantity == null || isNaN(data.quantity)) throw new Error('Quantity must be a number')
  if (!data.unit || data.unit.trim() === '') throw new Error('Unit is required')
  return repo.create(data)
}

function updateIngredient(id, data) {
  if (!repo.findById(id)) throw new Error('Ingredient not found')
  if (!data.name || data.name.trim() === '') throw new Error('Name is required')
  if (data.quantity == null || isNaN(data.quantity)) throw new Error('Quantity must be a number')
  if (!data.unit || data.unit.trim() === '') throw new Error('Unit is required')
  return repo.update(id, data)
}

function deleteIngredient(id) {
  if (!repo.findById(id)) throw new Error('Ingredient not found')
  return repo.remove(id)
}

function applyDeductions(deductions) {
  for (const { ingredientId, quantityUsed } of deductions) {
    repo.deductQuantity(ingredientId, quantityUsed)
  }
}

module.exports = { listIngredients, getExpiringSoon, getRecent, getNeededIngredients, createIngredient, updateIngredient, deleteIngredient, applyDeductions }
