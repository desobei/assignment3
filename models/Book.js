const mongoose = require('mongoose');

const REQUIRED_STRING = {
  type: String,
  trim: true,
  required: true
};

const bookSchema = new mongoose.Schema(
  {
    title: REQUIRED_STRING,
    author: REQUIRED_STRING,
    genre: REQUIRED_STRING,
    year: {
      type: Number,
      min: 0
    },
    pages: {
      type: Number,
      min: 1
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Book', bookSchema);
