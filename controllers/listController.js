const List = require("../models/List");
const Board = require("../models/Board");
const Card = require("../models/Card");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const mongoose = require("mongoose");

exports.createList = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.body.board)) {
    return next(new ErrorResponse(`Invalid board ID format`, 400));
  }

  const board = await Board.findOne({
    _id: req.body.board,
    user: req.user.id,
  });

  if (!board) {
    return next(
      new ErrorResponse(`Board not found with id of ${req.body.board}`, 404)
    );
  }

  const count = await List.countDocuments({ board: req.body.board });
  req.body.position = count;

  const list = await List.create(req.body);

  res.status(201).json({
    success: true,
    data: list,
  });
});

exports.updateList = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse(`Invalid list ID format`, 400));
  }

  let list = await List.findById(req.params.id).populate({
    path: "board",
    select: "user",
  });

  if (!list) {
    return next(
      new ErrorResponse(`List not found with id of ${req.params.id}`, 404)
    );
  }

  if (list.board.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this list`,
        401
      )
    );
  }

  list = await List.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: list });
});

exports.deleteList = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse(`Invalid list ID format`, 400));
  }

  const list = await List.findById(req.params.id).populate({
    path: "board",
    select: "user",
  });

  if (!list) {
    return next(
      new ErrorResponse(`List not found with id of ${req.params.id}`, 404)
    );
  }

  if (list.board.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this list`,
        401
      )
    );
  }

  await Card.deleteMany({ list: list._id });

  const positionToDelete = list.position;
  const boardId = list.board._id;

  await List.deleteOne({ _id: list._id });

  await List.updateMany(
    { board: boardId, position: { $gt: positionToDelete } },
    { $inc: { position: -1 } }
  );

  res.status(200).json({ success: true, data: {} });
});
