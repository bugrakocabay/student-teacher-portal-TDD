// Dependencies
const express = require("express");

// Imports
const AppError = require("./utils/appError");
const globalErrorHandler = require("./Controllers/errorController");
const morganLogger = require("./utils/morganLogger");

const app = express();

// Middleware
app.use(express.json());
if (process.env.NODE_ENV != "test" && process.env.NODE_ENV != "staging") {
	app.use(morganLogger);
}

// Route Handlers
app.use("/users", require("../src/Routes/userRoute"));
app.use("/classes", require("../src/Routes/classRoute"));

// Error Handling
app.all("*", (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl}`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
