const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Follow = require("../models/follow");
const FitnessPlan = require("../models/fitnessPlan");
const Subscription = require("../models/subscription");

// Get user feed (plans from followed trainers)
router.get("/", authMiddleware, async (req, res) => {
  try {
    // 1. Get followed trainers
    const follows = await Follow.find({ userId: req.user.id });
    const followedTrainerIds = follows.map(f => f.trainerId);

    // 2. Get all plans from these trainers
    const plans = await FitnessPlan.find({ trainerId: { $in: followedTrainerIds } }).populate("trainerId", "name");

    // 3. Map plans based on subscription
    const feed = await Promise.all(plans.map(async plan => {
      const subscribed = await Subscription.findOne({
        userId: req.user.id,
        planId: plan._id
      });

      if (subscribed) {
        return {
          _id: plan._id,
          title: plan.title,
          description: plan.description,
          price: plan.price,
          duration: plan.duration,
          trainerName: plan.trainerId.name
        };
      } else {
        return {
          _id: plan._id,
          title: plan.title,
          price: plan.price,
          trainerName: plan.trainerId.name
        };
      }
    }));

    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
