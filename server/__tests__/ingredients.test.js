const request = require('supertest')
const app = require('../app')
const db = require('../db')

beforeEach(() => {
  db.prepare('DELETE FROM recipe_ingredients').run()
  db.prepare('DELETE FROM recipes').run()
  db.prepare('DELETE FROM ingredients').run()
})

describe('GET /api/ingredients', () => {
  it('returns empty array when no ingredients', async () => {
    const res = await request(app).get('/api/ingredients')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns all ingredients', async () => {
    db.prepare("INSERT INTO ingredients (name, quantity, unit) VALUES ('Flour', 500, 'g')").run()
    const res = await request(app).get('/api/ingredients')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].name).toBe('Flour')
  })
})

describe('POST /api/ingredients', () => {
  it('creates an ingredient', async () => {
    const res = await request(app)
      .post('/api/ingredients')
      .send({ name: 'Butter', quantity: 250, unit: 'g', category: 'Dairy' })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Butter')
    expect(res.body.id).toBeDefined()
  })

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/ingredients').send({ quantity: 100, unit: 'g' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })
})

describe('PUT /api/ingredients/:id', () => {
  it('updates an ingredient', async () => {
    const { lastInsertRowid } = db.prepare("INSERT INTO ingredients (name, quantity, unit) VALUES ('Salt', 100, 'g')").run()
    const res = await request(app)
      .put(`/api/ingredients/${lastInsertRowid}`)
      .send({ name: 'Salt', quantity: 50, unit: 'g' })
    expect(res.status).toBe(200)
    expect(res.body.quantity).toBe(50)
  })

  it('returns 404 for unknown id', async () => {
    const res = await request(app).put('/api/ingredients/9999').send({ name: 'X', quantity: 1, unit: 'g' })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/ingredients/:id', () => {
  it('deletes an ingredient', async () => {
    const { lastInsertRowid } = db.prepare("INSERT INTO ingredients (name, quantity, unit) VALUES ('Sugar', 200, 'g')").run()
    const res = await request(app).delete(`/api/ingredients/${lastInsertRowid}`)
    expect(res.status).toBe(204)
  })

  it('returns 404 for unknown id', async () => {
    const res = await request(app).delete('/api/ingredients/9999')
    expect(res.status).toBe(404)
  })
})

describe('GET /api/ingredients/needed', () => {
  it('returns empty array when no recipe references any ingredient', async () => {
    const res = await request(app).get('/api/ingredients/needed')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns needed, have, and missing for an ingredient short on stock', async () => {
    const { lastInsertRowid: ingId } = db.prepare("INSERT INTO ingredients (name, quantity, unit) VALUES ('Flour', 100, 'g')").run()
    const { lastInsertRowid: recipeId } = db.prepare("INSERT INTO recipes (name, steps) VALUES ('Bread', '[]')").run()
    db.prepare("INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, 150, 'g')").run(recipeId, ingId)

    const res = await request(app).get('/api/ingredients/needed')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].name).toBe('Flour')
    expect(res.body[0].needed).toBe(150)
    expect(res.body[0].quantity).toBe(100)
    expect(res.body[0].missing).toBe(50)
  })

  it('sums quantity needed across multiple recipes using the same ingredient', async () => {
    const { lastInsertRowid: ingId } = db.prepare("INSERT INTO ingredients (name, quantity, unit) VALUES ('Eggs', 2, 'pieces')").run()
    const { lastInsertRowid: r1 } = db.prepare("INSERT INTO recipes (name, steps) VALUES ('Omelette', '[]')").run()
    const { lastInsertRowid: r2 } = db.prepare("INSERT INTO recipes (name, steps) VALUES ('Cake', '[]')").run()
    db.prepare("INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, 2, 'pieces')").run(r1, ingId)
    db.prepare("INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, 3, 'pieces')").run(r2, ingId)

    const res = await request(app).get('/api/ingredients/needed')
    expect(res.body).toHaveLength(1)
    expect(res.body[0].needed).toBe(5)
    expect(res.body[0].missing).toBe(3)
  })

  it('sets missing to 0 when fully stocked, and sorts short items before fully-stocked ones', async () => {
    const { lastInsertRowid: applesId } = db.prepare("INSERT INTO ingredients (name, quantity, unit) VALUES ('Apples', 10, 'pieces')").run()
    const { lastInsertRowid: zucchiniId } = db.prepare("INSERT INTO ingredients (name, quantity, unit) VALUES ('Zucchini', 0, 'pieces')").run()
    const { lastInsertRowid: recipeId } = db.prepare("INSERT INTO recipes (name, steps) VALUES ('Salad', '[]')").run()
    db.prepare("INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, 4, 'pieces')").run(recipeId, applesId)
    db.prepare("INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, 2, 'pieces')").run(recipeId, zucchiniId)

    const res = await request(app).get('/api/ingredients/needed')
    expect(res.body).toHaveLength(2)
    expect(res.body[0].name).toBe('Zucchini')
    expect(res.body[0].missing).toBe(2)
    expect(res.body[1].name).toBe('Apples')
    expect(res.body[1].missing).toBe(0)
  })
})
