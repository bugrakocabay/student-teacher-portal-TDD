// Modules
const express = require("express");

const app = express();

// Middleware
app.use(express.json());

// Route Handlers
app.use("/users", require("../src/Routes/userRoute"));

module.exports = app;
