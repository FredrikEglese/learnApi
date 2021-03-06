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

	sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.loginUser = AsyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	// Validate email & password
	if (!email || !password || email == null || password == null) {
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

	sendTokenResponse(user, 200, res);
});

// @desc    Create new user
// @route   GET /api/v1/auth/register
// @access  Private
exports.getMe = AsyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id);

	res.status(200).json({
		success: true,
		data: user,
	});
});

// Get token from model, create cookie & send response
const sendTokenResponse = (user, statusCode, res) => {
	// Create token
	const token = user.getSignedJwtToken();

	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 1000
		),
		httpOnly: true,
	};

	if (process.env.NODE_ENV === "production") {
		options.secure = true;
	}

	res.status(statusCode).cookie("token", token, options).json({
		success: true,
		token,
	});
};
