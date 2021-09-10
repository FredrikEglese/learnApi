const advancedResults = (model, populate) => async (req, res, next) => {
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

	var query = model.find(JSON.parse(queryStr));

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
	const total = await model.countDocuments();

	query = query.skip(startIndex).limit(limit);

	if (populate) {
		query = query.populate(populate);
	}

	// Finding resource and execute query
	const results = await query;

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

	res.advancedResults = {
		success: true,
		count: results.length,
		pagination,
		data: results,
	};

	next();
};

module.exports = advancedResults;
