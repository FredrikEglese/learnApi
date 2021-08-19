// NPM Packages
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

// Load env vars
dotenv.config({ path: "./config/config.env" });
const PORT = process.env.PORT || 5000;

const app = express();

// Mount middleware
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

// Mount routes
const bootcamps = require("./routes/bootcamps");
app.use("/api/v1/bootcamps", bootcamps);

// Start listening
app.listen(
	PORT,
	console.log(`Process runnning in ${process.env.NODE_ENV} mode on ${PORT}`)
);
