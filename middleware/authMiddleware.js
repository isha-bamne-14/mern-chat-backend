const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const protect = async (req, res, next) => {
  // Get the token that the user is passing
  let token;
  //console.log(req.headers);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized" });
    }
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Not authorized to create groups" });
    }
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = { protect, isAdmin };
