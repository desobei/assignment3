const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Book = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const reviewValidators = [
  body('book').notEmpty().withMessage('book is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Comment too long'),
  body('reviewer').optional().trim().isLength({ max: 100 }).withMessage('Reviewer too long')
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

router.post(
  '/',
  reviewValidators,
  handleValidation,
  asyncHandler(async (req, res) => {
    const bookExists = await Book.exists({ _id: req.body.book });
    if (!bookExists) {
      return res.status(404).json({ success: false, message: 'Referenced book not found' });
    }

    const review = await Review.create(req.body);
    res.status(201).json({ success: true, data: review });
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const reviews = await Review.find().populate('book', 'title author').sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id).populate('book', 'title author');
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.json({ success: true, data: review });
  })
);

router.put(
  '/:id',
  reviewValidators,
  handleValidation,
  asyncHandler(async (req, res) => {
    const bookExists = await Book.exists({ _id: req.body.book });
    if (!bookExists) {
      return res.status(404).json({ success: false, message: 'Referenced book not found' });
    }

    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({ success: true, data: review });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({ success: true, message: 'Review deleted' });
  })
);

module.exports = router;
