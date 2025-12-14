// const express = require("express");
// const FitnessPlan = require("../models/fitnessPlan");
// const authMiddleware = require("../middleware/authMiddleware");
// const trainerMiddleware = require("../middleware/trainerMiddleware");

// const router = express.Router();

// /* CREATE PLAN */
// router.post("/", authMiddleware, trainerMiddleware, async (req, res) => {
//   try {
//     const { title, description, price, duration } = req.body;

//     const plan = new FitnessPlan({
//       title,
//       description,
//       price,
//       duration,
//       trainerId: req.user.id
//     });

//     await plan.save();
//     res.status(201).json(plan);

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// /* GET TRAINER'S OWN PLANS */
// router.get("/my", authMiddleware, trainerMiddleware, async (req, res) => {
//   try {
//     const plans = await FitnessPlan.find({ trainerId: req.user.id });
//     res.json(plans);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// /* UPDATE PLAN */
// router.put("/:id", authMiddleware, trainerMiddleware, async (req, res) => {
//   try {
//     const plan = await FitnessPlan.findById(req.params.id);

//     if (!plan) {
//       return res.status(404).json({ message: "Plan not found" });
//     }

//     if (plan.trainerId.toString() !== req.user.id) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     const updatedPlan = await FitnessPlan.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );

//     res.json(updatedPlan);

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// /* DELETE PLAN */
// router.delete("/:id", authMiddleware, trainerMiddleware, async (req, res) => {
//   try {
//     const plan = await FitnessPlan.findById(req.params.id);

//     if (!plan) {
//       return res.status(404).json({ message: "Plan not found" });
//     }

//     if (plan.trainerId.toString() !== req.user.id) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     await plan.deleteOne();
//     res.json({ message: "Plan deleted" });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.get("/all", authMiddleware, async (req, res) => {
//   try {
//     const plans = await FitnessPlan.find().populate("trainerId", "name");
    
//     // Map plans to preview format
//     const previewPlans = plans.map(plan => ({
//       _id: plan._id,
//       title: plan.title,
//       price: plan.price,
//       trainerName: plan.trainerId.name
//     }));

//     res.json(previewPlans);

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// const Subscription = require("../models/subscription");

// // Get single plan by ID
// router.get("/:id", authMiddleware, async (req, res) => {
//   try {
//     const planId = req.params.id;

//     // Find plan
//     const plan = await FitnessPlan.findById(planId).populate("trainerId", "name");
//     if (!plan) {
//       return res.status(404).json({ message: "Plan not found" });
//     }

//     // Check if user is subscribed
//     const subscription = await Subscription.findOne({
//       userId: req.user.id,
//       planId: plan._id
//     });

//     if (subscription) {
//       // Subscribed → return full plan
//       return res.json({
//         _id: plan._id,
//         title: plan.title,
//         description: plan.description,
//         price: plan.price,
//         duration: plan.duration,
//         trainerName: plan.trainerId.name
//       });
//     } else {
//       // Not subscribed → return preview only
//       return res.json({
//         _id: plan._id,
//         title: plan.title,
//         price: plan.price,
//         trainerName: plan.trainerId.name
//       });
//     }

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// module.exports = router;


const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const trainerMiddleware = require("../middleware/trainerMiddleware");
const FitnessPlan = require("../models/fitnessPlan");
const Subscription = require("../models/subscription");

// ---------- TRAINER ROUTES ----------

// Create plan
router.post("/", authMiddleware, trainerMiddleware, async (req, res) => {
  try {
    const { title, description, price, duration } = req.body;
    const plan = await FitnessPlan.create({
      title,
      description,
      price,
      duration,
      trainerId: req.user.id
    });
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit plan
router.put("/:id", authMiddleware, trainerMiddleware, async (req, res) => {
  try {
    const plan = await FitnessPlan.findOneAndUpdate(
      { _id: req.params.id, trainerId: req.user.id },
      req.body,
      { new: true }
    );
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete plan
router.delete("/:id", authMiddleware, trainerMiddleware, async (req, res) => {
  try {
    const plan = await FitnessPlan.findOneAndDelete({
      _id: req.params.id,
      trainerId: req.user.id
    });
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json({ message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- USER / PUBLIC ROUTES ----------

// List all plans (preview for all users)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const plans = await FitnessPlan.find().populate("trainerId", "name");
    const previewPlans = plans.map(plan => ({
      _id: plan._id,
      title: plan.title,
      price: plan.price,
      trainerName: plan.trainerId.name
    }));
    res.json(previewPlans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single plan by ID (full for owner/subscribed, preview otherwise)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const plan = await FitnessPlan.findById(req.params.id).populate(
      "trainerId",
      "name"
    );
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // Trainer owner sees full plan
    if (req.user.role === "trainer" && plan.trainerId._id.toString() === req.user.id) {
      return res.json({
        _id: plan._id,
        title: plan.title,
        description: plan.description,
        price: plan.price,
        duration: plan.duration,
        trainerName: plan.trainerId.name
      });
    }

    // Check subscription for users
    const subscription = await Subscription.findOne({
      userId: req.user.id,
      planId: plan._id
    });

    if (subscription) {
      // Subscribed → full plan
      return res.json({
        _id: plan._id,
        title: plan.title,
        description: plan.description,
        price: plan.price,
        duration: plan.duration,
        trainerName: plan.trainerId.name
      });
    } else {
      // Not subscribed → preview only
      return res.json({
        _id: plan._id,
        title: plan.title,
        price: plan.price,
        trainerName: plan.trainerId.name
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

