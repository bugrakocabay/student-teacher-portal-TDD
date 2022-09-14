const express = require("express");
const userController = require("../Controllers/users");
const router = express.Router();

router.route("/register").post(userController.createUser);
router.route("/token/:token").get(userController.activateAccount);
//router.route("/").get(userController.getUser);

module.exports = router;
