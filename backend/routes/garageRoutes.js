// routes/garageRoutes.js
const express = require("express");
const router = express.Router();

const { createGarage, getGarages, getOwnerGarage, getOwnerGarages, updateGarage, getGarageById, incrementViews, deleteGarage } = require("../controllers/garageController");

router.get("/search", getGarages);
router.post("/register", createGarage);
router.get("/owner/:ownerId/all", getOwnerGarages);
router.get("/owner/:ownerId", getOwnerGarage);
router.put("/update/:id", updateGarage);
router.post("/:id/view", incrementViews);
router.delete("/:id", deleteGarage);
router.get("/:id", getGarageById);

// CRUCIAL: Node will crash if this line is missing or broken!
module.exports = router;