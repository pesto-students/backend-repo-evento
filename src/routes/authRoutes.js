const express = require("express");
const {signup, login, refresh, logout, getUserInfo} = require("../controllers/authController");
const {signupValidator, loginValidator} = require("../middlewares/validators/authValidator");
const {verifyJWT} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/refresh", refresh);
router.get("/userInfo", verifyJWT, getUserInfo);
router.post("/logout", verifyJWT, logout);

module.exports = router;