const express = require('express');
const {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
} = require('../controllers/boardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getBoards).post(protect, createBoard);
router
  .route('/:id')
  .get(protect, getBoard)
  .put(protect, updateBoard)
  .delete(protect, deleteBoard);

module.exports = router;