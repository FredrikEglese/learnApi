// NPM Packages
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");

const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

// Load env vars
dotenv.config({ path: "./config/config.env" });
const PORT = process.env.PORT || 5000;

// Connect to DB
connectDB();

const app = express();

// Body parser
app.use(express.json());

if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

// Mount routes
const bootcamps = require("./routes/bootcamps");
app.use("/api/v1/bootcamps", bootcamps);

const courses = require("./routes/courses");
app.use("/api/v1/courses", courses);

app.use(errorHandler);

// Start listening
const server = app.listen(
	PORT,
	console.log(
		`Process runnning in ${process.env.NODE_ENV} mode on port ${PORT}`.green
	)
);

// Handle Unhandled rejections

process.on("unhandledRejection", (err, promise) => {
	console.log(`Error: ${err.message}`.red.bold);
	server.close(() => {
		process.exit(1);
	});
});
