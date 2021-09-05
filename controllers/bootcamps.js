const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const AsyncHandler = require("../middleware/async");

const geocoder = require("../utils/geocoder");

// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = AsyncHandler(async (req, res, next) => {
	const reqQuery = { ...req.query };

	// Fields to exclude
	const removeFields = ["select", "sort", "page", "limit"];

	// Loop over remove fields and delete from query
	removeFields.forEach((param) => delete reqQuery[param]);

	// Create query string
	let queryStr = JSON.stringify(reqQuery);

	// Create operators ($gt, $gte, etc...)
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	var query = Bootcamp.find(JSON.parse(queryStr)).populate("courses");

	// Select fields
	if (req.query.select) {
		query = query.select(req.query.select.split(",").join(" "));
	}

	// Sort results
	if (req.query.sort) {
		query = query.sort(req.query.sort.split(",").join(" "));
	} else {
		query = query.sort("name");
	}

	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 25;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await Bootcamp.countDocuments();

	query = query.skip(startIndex).limit(limit);

	// Finding resource and execute query
	const bootcamps = await query;

	const pagination = {};

	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

	res.status(200).json({
		success: true,
		count: bootcamps.length,
		pagination,
		data: bootcamps,
	});
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
