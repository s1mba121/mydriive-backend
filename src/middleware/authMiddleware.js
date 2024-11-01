// src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const config = require("../config/config");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization header is missing or malformed" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded; // Store decoded user information in req.user
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
};
