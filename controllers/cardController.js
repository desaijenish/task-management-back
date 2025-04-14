const Card = require('../models/Card');
const List = require('../models/List');
const Board = require('../models/Board');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');




exports.createCard = asyncHandler(async (req, res, next) => {
  
  if (!mongoose.Types.ObjectId.isValid(req.body.list)) {
    return next(new ErrorResponse(`Invalid list ID format`, 400));
  }

  
  const list = await List.findById(req.body.list).populate({
    path: 'board',
    select: 'user',
  });

  if (!list) {
    return next(
      new ErrorResponse(`List not found with id of ${req.body.list}`, 404)
    );
  }

  
  if (list.board.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add cards to this list`,
        401
      )
    );
  }

  
  const count = await Card.countDocuments({ list: req.body.list });
  req.body.position = count;

  const card = await Card.create(req.body);

  res.status(201).json({
    success: true,
    data: card,
  });
});




exports.updateCard = asyncHandler(async (req, res, next) => {
  
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse(`Invalid card ID format`, 400));
  }

  let card = await Card.findById(req.params.id).populate({
    path: 'list',
    populate: {
      path: 'board',
      select: 'user',
    },
  });

  if (!card) {
    return next(
      new ErrorResponse(`Card not found with id of ${req.params.id}`, 404)
    );
  }

  
  if (card.list.board.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this card`,
        401
      )
    );
  }

  card = await Card.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: card });
});




exports.moveCard = asyncHandler(async (req, res, next) => {
  const { newListId, newPosition } = req.body;

  
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse(`Invalid card ID format`, 400));
  }

  
  if (!mongoose.Types.ObjectId.isValid(newListId)) {
    return next(new ErrorResponse(`Invalid new list ID format`, 400));
  }

  
  const card = await Card.findById(req.params.id).populate({
    path: 'list',
    populate: {
      path: 'board',
      select: 'user',
    },
  });

  if (!card) {
    return next(
      new ErrorResponse(`Card not found with id of ${req.params.id}`, 404)
    );
  }

  if (card.list.board.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to move this card`,
        401
      )
    );
  }

  const newList = await List.findOne({
    _id: newListId,
    board: card.list.board._id,
  });

  if (!newList) {
    return next(
      new ErrorResponse(
        `List not found with id of ${newListId} or not in the same board`,
        404
      )
    );
  }

  const oldListId = card.list._id;
  const oldPosition = card.position;

  if (oldListId.toString() === newListId) {
    if (newPosition === oldPosition) {
      return res.status(200).json({ success: true, data: card });
    }

    if (newPosition > oldPosition) {
      await Card.updateMany(
        {
          list: oldListId,
          position: { $gt: oldPosition, $lte: newPosition },
        },
        { $inc: { position: -1 } }
      );
    } else {
      await Card.updateMany(
        {
          list: oldListId,
          position: { $lt: oldPosition, $gte: newPosition },
        },
        { $inc: { position: 1 } }
      );
    }
  } else {

    await Card.updateMany(
      {
        list: oldListId,
        position: { $gt: oldPosition },
      },
      { $inc: { position: -1 } }
    );

    await Card.updateMany(
      {
        list: newListId,
        position: { $gte: newPosition },
      },
      { $inc: { position: 1 } }
    );
  }

  
  card.list = newListId;
  card.position = newPosition;
  await card.save();

  res.status(200).json({ success: true, data: card });
});




exports.deleteCard = asyncHandler(async (req, res, next) => {
  
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse(`Invalid card ID format`, 400));
  }

  const card = await Card.findById(req.params.id).populate({
    path: 'list',
    populate: {
      path: 'board',
      select: 'user',
    },
  });

  if (!card) {
    return next(
      new ErrorResponse(`Card not found with id of ${req.params.id}`, 404)
    );
  }

  
  if (card.list.board.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this card`,
        401
      )
    );
  }

  const listId = card.list._id;
  const position = card.position;

  
  await Card.deleteOne({ _id: card._id });

  
  await Card.updateMany(
    { list: listId, position: { $gt: position } },
    { $inc: { position: -1 } }
  );

  res.status(200).json({ success: true, data: {} });
});