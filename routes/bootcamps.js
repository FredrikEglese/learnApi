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
const { protect } = require("../middleware/auth");
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
	.post(protect, createBootcamp);

router.route("/radius/:postcode/:distance").get(getBootcampWithinRadius);

router
	.route("/:id")
	.get(getBootcamp)
	.put(protect, updateBootcamp)
	.delete(protect, deleteBootcamp);

module.exports = router;
