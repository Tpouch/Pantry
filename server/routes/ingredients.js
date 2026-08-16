const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/ingredientsController')

router.get('/', ctrl.list)
router.get('/needed', ctrl.listNeeded)
router.post('/', ctrl.create)
router.put('/:id', ctrl.update)
router.delete('/:id', ctrl.remove)

module.exports = router
