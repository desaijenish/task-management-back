const Board = require("../models/Board");
const List = require("../models/List");
const Card = require("../models/Card");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

exports.getBoards = asyncHandler(async (req, res, next) => {
  const boards = await Board.find({ user: req.user.id });
  res.status(200).json({ success: true, count: boards.length, data: boards });
});

exports.getBoard = asyncHandler(async (req, res, next) => {
  const board = await Board.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!board) {
    return next(
      new ErrorResponse(`Board not found with id of ${req.params.id}`, 404)
    );
  }

  const lists = await List.find({ board: board._id }).sort("position");

  const boardWithListsAndCards = await Promise.all(
    lists.map(async (list) => {
      const cards = await Card.find({ list: list._id }).sort("position");
      return {
        ...list.toObject(),
        cards,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: {
      board,
      lists: boardWithListsAndCards,
    },
  });
});

exports.createBoard = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  const board = await Board.create(req.body);

  res.status(201).json({
    success: true,
    data: board,
  });
});

exports.updateBoard = asyncHandler(async (req, res, next) => {
  let board = await Board.findById(req.params.id);

  if (!board) {
    return next(
      new ErrorResponse(`Board not found with id of ${req.params.id}`, 404)
    );
  }

  if (board.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this board`,
        401
      )
    );
  }

  board = await Board.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: board });
});

exports.deleteBoard = asyncHandler(async (req, res, next) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    return next(
      new ErrorResponse(`Board not found with id of ${req.params.id}`, 404)
    );
  }

  if (board.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this board`,
        401
      )
    );
  }

  await List.deleteMany({ board: board._id });
  await Card.deleteMany({ board: board._id });

  await board.remove();

  res.status(200).json({ success: true, data: {} });
});
