const express = require('express');
const {
  createList,
  updateList,
  deleteList,
} = require('../controllers/listController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(protect, createList);
router.route('/:id').put(protect, updateList).delete(protect, deleteList);

module.exports = router;