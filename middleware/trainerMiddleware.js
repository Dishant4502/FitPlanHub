const trainerMiddleware = (req, res, next) => {
  if (req.user.role !== "trainer") {
    return res.status(403).json({ message: "Trainer access only" });
  }
  next();
};

module.exports = trainerMiddleware;
