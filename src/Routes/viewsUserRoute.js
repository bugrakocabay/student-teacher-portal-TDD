const express = require("express");
const viewsController = require("../Controllers/viewsController");
const router = express.Router();

router
	.route("/login")
	.get(viewsController.loginRender)
	.post(viewsController.loginUser);
router
	.route("/register")
	.get(viewsController.registerRender)
	.post(viewsController.createUser);

module.exports = router;
