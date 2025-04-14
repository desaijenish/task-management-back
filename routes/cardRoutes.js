const express = require('express');
const {
  createCard,
  updateCard,
  moveCard,
  deleteCard,
} = require('../controllers/cardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(protect, createCard);
router.route('/:id').put(protect, updateCard).delete(protect, deleteCard);
router.route('/:id/move').put(protect, moveCard);

module.exports = router;