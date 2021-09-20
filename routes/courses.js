const express = require("express");

// Controllers
const {
	getCourses,
	getCourse,
	addCourse,
	updateCourse,
	deleteCourse,
} = require("../controllers/courses");

// Middleware
const advancedResults = require("../middleware/advancesResults");
const { protect, authorise } = require("../middleware/auth");

// Models
const Course = require("../models/Course");

const router = express.Router({ mergeParams: true });

router
	.route("/")
	.get(
		advancedResults(Course, {
			path: "bootcamp",
			select: "name description slug",
		}),
		getCourses
	)
	.post(protect, authorise("publisher", "admin"), addCourse);

router
	.route("/:id")
	.get(getCourse)
	.put(protect, authorise("publisher", "admin"), updateCourse)
	.delete(protect, authorise("publisher", "admin"), deleteCourse);

module.exports = router;
