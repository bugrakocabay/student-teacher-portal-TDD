const express = require("express");
const userController = require("../Controllers/users");
const router = express.Router();

router.route("/register").post(userController.createUser);

module.exports = router;
