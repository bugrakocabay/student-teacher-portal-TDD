const express = require("express");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./Controllers/errorController");
const app = express();

// Middleware
app.use(express.json());

// Route Handlers
app.use("/users", require("../src/Routes/userRoute"));
app.use("/classes", require("../src/Routes/classRoute"));

app.all("*", (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl}`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
