const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Subscription = require("../models/subscription");
const FitnessPlan = require("../models/fitnessPlan");

// Subscribe to a plan
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { planId } = req.body;

    // Check if plan exists
    const plan = await FitnessPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Check if user already subscribed
    const existing = await Subscription.findOne({
      userId: req.user.id,
      planId
    });
    if (existing) {
      return res.status(400).json({ message: "Already subscribed" });
    }

    // Create subscription
    const subscription = new Subscription({
      userId: req.user.id,
      planId
    });

    await subscription.save();
    res.status(201).json({ message: "Subscription successful" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
