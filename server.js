const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));


const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);


const authMiddleware = require("./middleware/authMiddleware");

app.get("/api/test", authMiddleware, (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});


const planRoutes = require("./routes/planRoutes");
app.use("/api/plans", planRoutes);


const subscriptionRoutes = require("./routes/subscriptionRoutes");
app.use("/api/subscriptions", subscriptionRoutes);


const followRoutes = require("./routes/followRoutes");
const feedRoutes = require("./routes/feedRoutes");

app.use("/api/follow", followRoutes);
app.use("/api/feed", feedRoutes);




app.listen(5000, () => {
  console.log("Server running on port 5000");
});
