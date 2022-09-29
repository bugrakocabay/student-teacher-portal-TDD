// Dependencies
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

require("dotenv").config();

// Imports
const AppError = require("./utils/appError");
const globalErrorHandler = require("./Controllers/errorController");
const morganLogger = require("./utils/morganLogger");

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
if (process.env.NODE_ENV != "test" && process.env.NODE_ENV != "staging") {
	app.use(morganLogger);
}

// API Route Handlers
app.use("/api/v1/users", require("./Routes/userRoute"));
app.use("/api/v1/classes", require("./Routes/classRoute"));

// Views Route Handlers
app.use("/users", require("./Routes/viewsUserRoute"));
app.use("/classes", require("./Routes/viewsClassRoute"));

// Error Handling
app.all("*", (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl}`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
