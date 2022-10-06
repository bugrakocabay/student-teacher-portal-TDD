const express = require("express");
const userController = require("../Controllers/users");
const usersAuthController = require("../Controllers/usersAuth");
const tokenAuth = require("../Middlewares/tokenAuth");

const router = express.Router();

router.route("/login").post(usersAuthController.loginUser);
router.route("/logout").post(usersAuthController.logoutUser);
router.route("/register").post(userController.createUser);
router.route("/token/:token").get(userController.activateAccount);
router.route("/").get(userController.getUsers);
router
	.route("/:id")
	.get(userController.getSingleUser)
	.put(tokenAuth, userController.updateUser)
	.delete(tokenAuth, userController.deleteUser);
router.route("/:id/classes").get(tokenAuth, userController.getStudentsClasses);

module.exports = router;
