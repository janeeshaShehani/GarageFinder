const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    garage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Garage"
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    rating: Number,

    comment: String,

    name: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Review", reviewSchema);