const express = require("express");
const userController = require("../Controllers/users");
const usersAuthController = require("../Controllers/usersAuth");
const viewsController = require("../Controllers/viewsController");
const tokenAuth = require("../Middlewares/tokenAuth");

const router = express.Router();

router
	.route("/login")
	.post(usersAuthController.loginUser)
	.get(viewsController.loginRender);
router.route("/logout").post(usersAuthController.logoutUser);
router
	.route("/register")
	.post(userController.createUser)
	.get(viewsController.registerRender);
router.route("/token/:token").post(userController.activateAccount);
router.route("/").get(userController.getUsers);
router
	.route("/:id")
	.get(userController.getSingleUser)
	.put(tokenAuth, userController.updateUser)
	.delete(tokenAuth, userController.deleteUser);

module.exports = router;
