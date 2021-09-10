const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const AsyncHandler = require("../middleware/async");

// @desc    Create new user
// @route   POST /api/v1/auth/register
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

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.loginUser = AsyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	// Validate email & password
	if (!email || !password) {
		return next(new ErrorResponse("Please provide an email and password", 400));
	}

	// Check for user
	// TODO: Add timeout
	const user = await User.findOne({ email }).select("+password");
	if (!user) {
		return next(new ErrorResponse("Invalid credentials", 401));
	}

	// Check if password matches
	// TODO: Add timeout
	const isMatch = await user.isPasswordMatching(password);
	if (!isMatch) {
		return next(new ErrorResponse("Invalid credentials", 401));
	}

	// Create token
	const token = user.getSignedJwtToken();

	res.status(201).json({ success: true, token });
});
