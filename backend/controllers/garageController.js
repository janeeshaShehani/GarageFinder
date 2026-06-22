// controllers/garageController.js

// 1. Declared ONLY once at the very top of the file
const Garage = require("../models/Garage");
const User = require("../models/User");
const Review = require("../models/Review");

// Fetch garages matching query criteria (district and serviceType)
exports.getGarages = async (req, res) => {
  try {
    const { district, serviceType } = req.query;
    let queryFilter = {};

    if (district) {
      queryFilter.district = new RegExp(district, "i");
    }

    if (serviceType) {
      queryFilter.services = { $in: [serviceType] };
    }

    const garages = await Garage.find(queryFilter).populate("owner", "name email");
    res.status(200).json(garages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a brand new garage profile listing
exports.createGarage = async (req, res) => {
  try {
    const { 
      owner, garageName, ownerName, phone, email, 
      district, address, description, openTime, 
      closeTime, openDays, vehicleTypes, services, images,
      latitude, longitude
    } = req.body;

    const newGarage = await Garage.create({
      owner,
      garageName,
      ownerName,
      phone,
      email,
      district,
      address,
      description,
      openTime,
      closeTime,
      openDays,
      vehicleTypes,
      services,
      images,
      latitude: latitude !== undefined ? latitude : null,
      longitude: longitude !== undefined ? longitude : null
    });

    await User.findByIdAndUpdate(owner, { role: "garage" });

    res.status(201).json({
      success: true,
      message: "Garage Created successfully",
      garage: newGarage
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Fetch a single garage profile owned by the logged-in user specifically for dashboard isolation
exports.getOwnerGarage = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const garage = await Garage.findOne({ owner: ownerId });

    if (!garage) {
      return res.status(404).json({ message: "No garage profile found for this account." });
    }

    res.status(200).json(garage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch all garages owned by the logged-in user
exports.getOwnerGarages = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const garages = await Garage.find({ owner: ownerId });
    res.status(200).json(garages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADDED: Update an existing garage profile details
// controllers/garageController.js

exports.updateGarage = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Safety Check: Make sure the ID isn't 'undefined', empty, or malformed
    if (!id || id === 'undefined' || id === '') {
      return res.status(400).json({ message: "Invalid or missing Garage ID" });
    }

    // 2. Prevent updating the strict unique system identifier properties
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.owner;

    const updatedGarage = await Garage.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedGarage) {
      return res.status(404).json({ message: "Garage profile not found." });
    }

    res.status(200).json({
      success: true,
      message: "Garage details updated successfully!",
      garage: updatedGarage
    });
  } catch (error) {
    console.error("Backend Error during update:", error.message); // This prints the error safely to your console
    res.status(500).json({ message: error.message });
  }
};

// Fetch details of a single garage by ID (without incrementing views)
exports.getGarageById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined' || id === '') {
      return res.status(400).json({ message: "Invalid or missing Garage ID" });
    }

    const garage = await Garage.findById(id).populate("owner", "name email");

    if (!garage) {
      return res.status(404).json({ message: "Garage not found." });
    }

    res.status(200).json(garage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Increment the views count for a garage
exports.incrementViews = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined' || id === '') {
      return res.status(400).json({ message: "Invalid or missing Garage ID" });
    }

    const garage = await Garage.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!garage) {
      return res.status(404).json({ message: "Garage not found." });
    }

    res.status(200).json({ success: true, views: garage.views });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a garage by ID and clean up references
exports.deleteGarage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined' || id === '') {
      return res.status(400).json({ message: "Invalid or missing Garage ID" });
    }

    const garage = await Garage.findById(id);
    if (!garage) {
      return res.status(404).json({ message: "Garage not found." });
    }

    const ownerId = garage.owner;

    // Delete the garage and its reviews
    await Garage.findByIdAndDelete(id);
    await Review.deleteMany({ garage: id });

    // If owner has no other garages left, update role back to customer
    const remainingGaragesCount = await Garage.countDocuments({ owner: ownerId });
    if (remainingGaragesCount === 0) {
      await User.findByIdAndUpdate(ownerId, { role: "customer" });
    }

    res.status(200).json({ success: true, message: "Garage deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};