const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/verify-email/:token", authController.verifyEmail);
router.get("/protegida", auth, authController.getProtected);
router.get("/users", auth, authController.getAllUsers);
router.get("/users/search", auth, authController.searchUsers);

module.exports = router;
