const express = require("express");
const userController = require("../Controllers/users");
const usersAuthController = require("../Controllers/usersAuth");
const tokenAuth = require("../Middlewares/tokenAuth");

const router = express.Router();

router.route("/register").post(userController.createUser);
router.route("/token/:token").post(userController.activateAccount);
router.route("/").get(userController.getUsers);
router
	.route("/:id")
	.get(userController.getSingleUser)
	.put(tokenAuth, userController.updateUser)
	.delete(tokenAuth, userController.deleteUser);
router.route("/login").post(usersAuthController.loginUser);
router.route("/logout").post(usersAuthController.logoutUser);

module.exports = router;
