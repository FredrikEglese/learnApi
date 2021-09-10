const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const AsyncHandler = require("../middleware/async");

// @desc    Create new user
// @route   POST /api/v1/user/
// @access  Public
exports.registerUser = AsyncHandler(async (req, res, next) => {
	res.status(201).json({ success: true });
});
