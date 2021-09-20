const express = require("express");

// Controllers
const {
	getBootcamp,
	getBootcamps,
	createBootcamp,
	updateBootcamp,
	deleteBootcamp,
	getBootcampWithinRadius,
} = require("../controllers/bootcamps");

// Middleware
const { protect, authorise } = require("../middleware/auth");
const advancedResults = require("../middleware/advancesResults");

// Models
const Bootcamp = require("../models/Bootcamp");

// Include other resource routers
const courseRouter = require("./courses");

// Start router
const router = express.Router();

// Re-route into other resource routers
router.use("/:bootcampId/courses", courseRouter);

router
	.route("/")
	.get(advancedResults(Bootcamp, "courses"), getBootcamps)
	.post(protect, authorise("publisher", "admin"), createBootcamp);

router.route("/radius/:postcode/:distance").get(getBootcampWithinRadius);

router
	.route("/:id")
	.get(getBootcamp)
	.put(protect, authorise("publisher", "admin"), updateBootcamp)
	.delete(protect, authorise("publisher", "admin"), deleteBootcamp);

module.exports = router;
