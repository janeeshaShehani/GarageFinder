const mongoose = require("mongoose");

const garageSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true 
    },

    garageName: {
      type: String,
      required: true
    },

    ownerName: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    },

    district: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    // Optional field: Defaults to an empty string if left blank by the owner
    description: {
      type: String,
      default: "" 
    },

    openTime: {
      type: String,
      required: true
    },

    closeTime: {
      type: String,
      required: true
    },

    openDays: [String],

    services: {
      type: [String],
      default: ["Engine Repair", "Oil Change", "Battery Service"]
    },

    vehicleTypes: [String],

    // Optional field: Defaults to an empty array if no images are selected
    images: {
      type: [String],
      default: []
    },

    views: {
      type: Number,
      default: 0
    },

    numReviews: {
      type: Number,
      default: 0
    },

    rating: {
      type: Number,
      default: 0
    },

    latitude: {
      type: Number,
      default: null
    },

    longitude: {
      type: Number,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Garage", garageSchema);