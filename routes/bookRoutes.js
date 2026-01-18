const express = require('express');
const { body, validationResult } = require('express-validator');
const Book = require('../models/Book');
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const bookValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('genre').trim().notEmpty().withMessage('Genre is required'),
  body('year').optional().isInt({ min: 0 }).withMessage('Year must be a positive number'),
  body('pages').optional().isInt({ min: 1 }).withMessage('Pages must be 1 or greater'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description too long')
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json({ success: true, count: books.length, data: books });
  })
);

router.post(
  '/',
  bookValidators,
  handleValidation,
  asyncHandler(async (req, res) => {
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, data: book });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.json({ success: true, data: book });
  })
);

router.put(
  '/:id',
  bookValidators,
  handleValidation,
  asyncHandler(async (req, res) => {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.json({ success: true, data: book });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    await Review.deleteMany({ book: book._id });

    res.json({ success: true, message: 'Book and related reviews deleted' });
  })
);

router.get(
  '/:id/reviews',
  asyncHandler(async (req, res) => {
    const reviews = await Review.find({ book: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  })
);

module.exports = router;
