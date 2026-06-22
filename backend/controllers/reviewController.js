const Review = require("../models/Review");
const Garage = require("../models/Garage");

exports.getReviews = async (req, res) => {
  try {
    const { garageId } = req.query;
    let filter = {};
    if (garageId) {
      filter.garage = garageId;
    }
    const reviews = await Review.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { garageId, userId, rating, comment, name } = req.body;

    if (!garageId || rating === undefined || rating === null) {
      return res.status(400).json({ message: "Garage ID and rating are required." });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be a number between 1 and 5." });
    }

    const review = await Review.create({
      garage: garageId,
      user: userId || null,
      rating: numericRating,
      comment,
      name: name || null
    });

    // Recalculate average rating and review count for the garage
    const reviews = await Review.find({ garage: garageId });
    const numReviews = reviews.length;
    const totalRating = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
    const avgRating = totalRating / numReviews;

    await Garage.findByIdAndUpdate(garageId, {
      numReviews,
      rating: parseFloat(avgRating.toFixed(1))
    });

    // Populate user info for frontend response mapping
    const populatedReview = await Review.findById(review._id).populate("user", "name email");

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};