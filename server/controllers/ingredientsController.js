const service = require('../services/ingredientsService')

function list(req, res) {
  res.json(service.listIngredients())
}

function listNeeded(req, res) {
  res.json(service.getNeededIngredients())
}

function create(req, res) {
  try {
    res.status(201).json(service.createIngredient(req.body))
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

function update(req, res) {
  try {
    res.json(service.updateIngredient(Number(req.params.id), req.body))
  } catch (e) {
    const status = e.message === 'Ingredient not found' ? 404 : 400
    res.status(status).json({ error: e.message })
  }
}

function remove(req, res) {
  try {
    service.deleteIngredient(Number(req.params.id))
    res.status(204).end()
  } catch (e) {
    res.status(404).json({ error: e.message })
  }
}

module.exports = { list, listNeeded, create, update, remove }
