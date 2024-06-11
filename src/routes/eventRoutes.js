const express = require("express");
const {getSingleEvent, getAllEvents, uploadEventBanner, uploadEventThumbnail, createEvent} = require("../controllers/eventController");
const {verifyJWT, verifyRoles} = require("../middlewares/authMiddleware");
const {UserRolesEnum} = require("../utils/constants");
const upload = require("../middlewares/multerMiddleware");

const router = express.Router();

router.get("/", verifyJWT, getAllEvents);
router.post("/", verifyJWT, createEvent);
router.get("/:id", getSingleEvent);
router.post("/upload-banner", upload.single("banner"), uploadEventBanner);
router.post("/upload-thumbnail", upload.single("thumbnail"), uploadEventThumbnail);

module.exports = router;
