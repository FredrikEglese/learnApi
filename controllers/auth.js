const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const AsyncHandler = require("../middleware/async");

// @desc    Create new user
// @route   POST /api/v1/user/
// @access  Public
exports.registerUser = AsyncHandler(async (req, res, next) => {
	const { name, email, password, role } = req.body;

	// Create user
	const user = await User.create({
		name,
		email,
		password,
		role,
	});

	// Create token
	const token = user.getSignedJwtToken();

	res.status(201).json({ success: true, token });
});
