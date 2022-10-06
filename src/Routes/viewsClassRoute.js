const express = require("express");
const viewsController = require("../Controllers/viewsController");
const router = express.Router();
const tokenAuth = require("../Middlewares/tokenAuth");

router.route("/").get(tokenAuth, viewsController.mainRender);
router.route("/create-class").get(tokenAuth, viewsController.createClassPage);
router.route("/create-class").post(tokenAuth, viewsController.createClass);
router.route("/:id").get(tokenAuth, viewsController.classRender);
router.route("/:id/join").get(tokenAuth, viewsController.joinClass);

module.exports = router;
