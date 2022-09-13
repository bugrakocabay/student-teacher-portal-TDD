const express = require("express");
const userController = require("../Controllers/users");
const router = express.Router();

router.route("/register").post(userController.createUser);
//router.route("/").get(userController.getUser);

module.exports = router;
