const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const AsyncHandler = require("../middleware/async");

const geocoder = require("../utils/geocoder");

// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = AsyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

// @desc Get single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = AsyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);
	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of: ${req.params.id}`, 404)
		);
	}
	res.status(200).json({ success: true, data: bootcamp });
});

// @desc Create new bootcamp
// @route POST /api/v1/bootcamps/
// @access Private
exports.createBootcamp = AsyncHandler(async (req, res, next) => {
	// Add user to req.body
	req.body.user = req.user.id;

	// Check for published bootcamp
	const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

	// If user is not an admin, they can only add one bootcamp
	if (publishedBootcamp && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`User with id ${req.user.id} has already published a bootcamp`,
				400
			)
		);
	}

	const bootcamp = await Bootcamp.create(req.body);

	res.status(201).json({ success: true, data: bootcamp });
});

// @desc Update bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = AsyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of: ${req.params.id}`, 404)
		);
	}

	res.status(200).json({ success: true, data: bootcamp });
});

// @desc Delete single bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = AsyncHandler(async (req, res, next) => {
	const deletedBootcamp = await Bootcamp.findById(req.params.id);

	if (!deletedBootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of: ${req.params.id}`, 404)
		);
	}

	deletedBootcamp.remove();

	res.status(200).json({ success: true, data: {} });
});

// @desc Get bootcamps within a radius of a location
// @route GET /api/v1/bootcamps/radius/:postcode/:radius
// @access Private
exports.getBootcampWithinRadius = AsyncHandler(async (req, res, next) => {
	const { postcode, distance } = req.params;

	// Get lat/lng from geocoder
	const loc = await geocoder.geocode(postcode);

	if (!loc) {
		return next(
			new ErrorResponse(`Location not found for postcode: ${postcode}`, 404)
		);
	}

	const lat = loc[0].latitude;
	const lng = loc[0].longitude;

	// Calc radius using radians
	// Divide dist by radius of earth
	// Earth radius - 6,378 km
	const radius = distance / 6378;

	const bootcamps = await Bootcamp.find({
		location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
	});

	res
		.status(200)
		.json({ success: true, count: bootcamps.length, data: bootcamps });
});

module.exports = exports;
