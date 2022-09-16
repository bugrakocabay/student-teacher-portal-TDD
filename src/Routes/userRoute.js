const express = require("express");
const userController = require("../Controllers/users");
const usersAuthController = require("../Controllers/usersAuth");
const router = express.Router();

router.route("/register").post(userController.createUser);
router.route("/token/:token").post(userController.activateAccount);
router.route("/").get(userController.getUsers);
router
	.route("/:id")
	.get(userController.getSingleUser)
	.put(userController.updateUser);
router.route("/login").post(usersAuthController.loginUser);

module.exports = router;
