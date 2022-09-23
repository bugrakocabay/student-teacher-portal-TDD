const express = require("express");
const tokenAuth = require("../Middlewares/tokenAuth");
const classController = require("../Controllers/classController");
const router = express.Router();

router.route("/create-class").post(tokenAuth, classController.createClass);
router.route("/").get(tokenAuth, classController.getClasses);

module.exports = router;
