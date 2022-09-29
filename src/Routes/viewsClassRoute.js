const express = require("express");
const viewsController = require("../Controllers/viewsController");
const router = express.Router();

router.route("/").get(viewsController.mainRender);

module.exports = router;
