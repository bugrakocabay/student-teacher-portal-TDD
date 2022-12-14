const express = require("express");
const tokenAuth = require("../Middlewares/tokenAuth");
const classController = require("../Controllers/classController");
const router = express.Router();

router.route("/create-class").post(tokenAuth, classController.createClass);
router.route("/").get(tokenAuth, classController.getClasses);
router
	.route("/:id")
	.delete(tokenAuth, classController.deleteClass)
	.put(tokenAuth, classController.updateClass)
	.get(tokenAuth, classController.getSingleClass);

router.route("/:id/join").get(tokenAuth, classController.joinClass);

module.exports = router;
