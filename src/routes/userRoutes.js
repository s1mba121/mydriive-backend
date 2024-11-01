// src/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/:userId/data", userController.getUserData);

module.exports = router;
