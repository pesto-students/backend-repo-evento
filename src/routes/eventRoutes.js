const express = require("express");
const {getSingleEvent, getAllEvents, uploadEventBanner, uploadEventThumbnail, createEvent, createCheckoutSession} = require("../controllers/eventController");
const {verifyJWT, verifyRoles} = require("../middlewares/authMiddleware");
const {UserRolesEnum} = require("../utils/constants");
const upload = require("../middlewares/multerMiddleware");
const {createEventValidator} = require("../middlewares/validators/eventValidator");

const router = express.Router();

router.get("/", verifyJWT, getAllEvents);
router.post("/", verifyJWT, createEventValidator, createEvent);
router.post("/checkout-session", createCheckoutSession);
router.get("/:id", getSingleEvent);
router.post("/upload-banner", upload.single("banner"), uploadEventBanner);
router.post("/upload-thumbnail", upload.single("thumbnail"), uploadEventThumbnail);

module.exports = router;
