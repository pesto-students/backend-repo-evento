const express = require("express");
const { getSingleEvent, getAllEvents } = require("../controllers/eventController");
const {verifyJWT, verifyRoles} = require("../middlewares/authMiddleware");
const {UserRolesEnum} = require("../utils/constants");

const router = express.Router();

router.get("/", verifyJWT, getAllEvents);
router.get("/:id", getSingleEvent);


module.exports = router;
