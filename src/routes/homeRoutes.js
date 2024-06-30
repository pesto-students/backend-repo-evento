const express = require("express");
const {getHomeData} = require("../controllers/homeController");
const {verifyJWT, verifyRoles} = require("../middlewares/authMiddleware");
const {UserRolesEnum} = require("../utils/constants");

const router = express.Router();

router.get("/", getHomeData);

module.exports = router;