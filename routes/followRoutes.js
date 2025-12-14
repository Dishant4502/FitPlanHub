const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Follow = require("../models/follow");

// Follow a trainer
router.post("/follow/:trainerId", authMiddleware, async (req, res) => {
  try {
    const { trainerId } = req.params;

    // Prevent following self
    if (req.user.id === trainerId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    // Check if already following
    const existing = await Follow.findOne({
      userId: req.user.id,
      trainerId
    });

    if (existing) {
      return res.status(400).json({ message: "Already following" });
    }

    const follow = await Follow.create({
      userId: req.user.id,
      trainerId
    });

    res.status(201).json({ message: "Trainer followed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unfollow a trainer
router.delete("/unfollow/:trainerId", authMiddleware, async (req, res) => {
  try {
    const { trainerId } = req.params;

    const deleted = await Follow.findOneAndDelete({
      userId: req.user.id,
      trainerId
    });

    if (!deleted) return res.status(404).json({ message: "Not following this trainer" });

    res.json({ message: "Trainer unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get list of followed trainers
router.get("/mytrainers", authMiddleware, async (req, res) => {
  try {
    const follows = await Follow.find({ userId: req.user.id })
      .populate("trainerId", "name email");

    // Remove broken references (deleted trainers)
    const trainers = follows
      .filter(f => f.trainerId !== null)
      .map(f => ({
        trainerId: f.trainerId._id,
        name: f.trainerId.name,
        email: f.trainerId.email
      }));

    res.json(trainers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
