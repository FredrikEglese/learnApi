const mongoose = require("mongoose");

const BootcampSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please add a name"],
		unique: true,
		trim: true,
		maxlength: [50, "Name can not be longer than 50 characters"],
	},
	slug: String,
	description: {
		type: String,
		required: [true, "Please add a description"],
		maxlength: [500, "Description can not be longer than 500 characters"],
	},
	website: {
		type: String,
		match: [
			`https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)`,
			"Please use a valid URL with http or https",
		],
	},
	email: {
		type: String,
		match: [
			"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$",
			"Please use a valid email address",
		],
	},
	address: {
		type: String,
		required: [true, "Please use an address"],
		location: {
			// GeoJSON Point
			type: {
				type: String,
				enum: ["Point"],
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
				index: "2dsphere",
			},
			formattedAddress: String,
			street: String,
			city: String,
			state: String,
			postcode: String,
			country: String,
		},
		careers: {
			type: [String],
			required: true,
			enum: [
				"Web Development",
				"Mobile Development",
				"UI/UX",
				"Data Science",
				"Other",
			],
		},
		averageRating: {
			type: Number,
			min: [0, "Rating must be at least 0"],
			max: [10, "Rating must be at most 10"],
		},
		averageCost: {
			type: Number,
		},
		photo: {
			type: String,
			default: "no-photo.jpg",
		},
		housing: {
			type: Boolean,
			default: false,
		},
		jobAssistance: {
			type: Boolean,
			default: false,
		},
		jobGuarantee: {
			type: Boolean,
			default: false,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);
