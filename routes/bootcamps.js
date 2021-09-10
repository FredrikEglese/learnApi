const express = require("express");
const {
	getBootcamp,
	getBootcamps,
	createBootcamp,
	updateBootcamp,
	deleteBootcamp,
	getBootcampWithinRadius,
} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancesResults");

// Include other resource routers
const courseRouter = require("./courses");

const router = express.Router();

// Re-route into other resource routers
router.use("/:bootcampId/courses", courseRouter);

router
	.route("/")
	.get(advancedResults(Bootcamp, "courses"), getBootcamps)
	.post(createBootcamp);

router.route("/radius/:postcode/:distance").get(getBootcampWithinRadius);

router
	.route("/:id")
	.get(getBootcamp)
	.put(updateBootcamp)
	.delete(deleteBootcamp);

module.exports = router;
