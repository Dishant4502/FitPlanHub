const mongoose = require("mongoose");

const fitnessPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

module.exports =
  mongoose.models.FitnessPlan ||
  mongoose.model("FitnessPlan", fitnessPlanSchema);
