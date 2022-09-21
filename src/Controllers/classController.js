const AppError = require("../utils/appError");

exports.createClass = async (req, res, next) => {
	if (req.authenticatedUser) {
		return res.send();
	}
	next(new AppError("Unauthorized", 401));
};
