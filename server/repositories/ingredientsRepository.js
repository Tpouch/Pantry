const db = require('../db')

function findAll() {
  return db.prepare('SELECT * FROM ingredients ORDER BY created_at DESC').all()
}

function findById(id) {
  return db.prepare('SELECT * FROM ingredients WHERE id = ?').get(id)
}

function findExpiringSoon(withinDays = 14) {
  return db.prepare(`
    SELECT * FROM ingredients
    WHERE expiration_date IS NOT NULL
      AND expiration_date <= date('now', '+' || ? || ' days')
      AND expiration_date >= date('now')
    ORDER BY expiration_date ASC
  `).all(withinDays)
}

function findRecent(limit = 5) {
  return db.prepare('SELECT * FROM ingredients ORDER BY created_at DESC LIMIT ?').all(limit)
}

function findNeeded() {
  return db.prepare(`
    SELECT i.*, SUM(ri.quantity) as needed, GROUP_CONCAT(DISTINCT ri.unit) as needed_units
    FROM recipe_ingredients ri
    JOIN ingredients i ON i.id = ri.ingredient_id
    GROUP BY i.id
  `).all()
}

function create({ name, quantity, unit, expiration_date, category }) {
  const result = db.prepare(`
    INSERT INTO ingredients (name, quantity, unit, expiration_date, category)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, quantity, unit, expiration_date || null, category || null)
  return findById(result.lastInsertRowid)
}

function update(id, { name, quantity, unit, expiration_date, category }) {
  db.prepare(`
    UPDATE ingredients SET name = ?, quantity = ?, unit = ?, expiration_date = ?, category = ?
    WHERE id = ?
  `).run(name, quantity, unit, expiration_date || null, category || null, id)
  return findById(id)
}

function remove(id) {
  return db.prepare('DELETE FROM ingredients WHERE id = ?').run(id)
}

function deductQuantity(id, amount) {
  db.prepare('UPDATE ingredients SET quantity = MAX(0, quantity - ?) WHERE id = ?').run(amount, id)
}

module.exports = { findAll, findById, findExpiringSoon, findRecent, findNeeded, create, update, remove, deductQuantity }
