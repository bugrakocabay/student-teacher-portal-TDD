const express = require("express");
const viewsController = require("../Controllers/viewsController");
const router = express.Router();
const tokenAuth = require("../Middlewares/tokenAuth");

router.route("/").get(tokenAuth, viewsController.mainRender);

module.exports = router;
