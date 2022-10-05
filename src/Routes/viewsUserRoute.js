const express = require("express");
const viewsController = require("../Controllers/viewsController");
const router = express.Router();
const tokenAuth = require("../Middlewares/tokenAuth");

router
	.route("/login")
	.get(viewsController.loginRender)
	.post(viewsController.loginUser);
router
	.route("/register")
	.get(viewsController.registerRender)
	.post(viewsController.createUser);

router.route("/logout").get(viewsController.logoutUser);
router.route("/token/:token").get(viewsController.activationSuccess);
router.route("/:id").get(tokenAuth, viewsController.userPageRender);

module.exports = router;
